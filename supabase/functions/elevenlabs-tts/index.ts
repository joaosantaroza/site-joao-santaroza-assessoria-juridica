import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

// Get allowed origins from environment or use defaults
const ALLOWED_ORIGINS = [
  "https://lovable.dev",
  "https://lovableproject.com",
  // Custom domain(s)
  "https://joaosantarozaadvocacia.com.br",
  "https://www.joaosantarozaadvocacia.com.br",
];

// Helper to check if origin is allowed (including Lovable preview domains)
const isAllowedOrigin = (origin: string | null): boolean => {
  const o = origin?.trim();
  if (!o) return false;

  // In some sandboxed preview iframes the browser sends Origin: null.
  // We allow it so the in-editor preview can call this function.
  if (o === "null") return true;

  // Allow Lovable preview domains (various formats)
  if (
    o.includes(".lovableproject.com") ||
    o.includes(".lovable.app") ||
    o.includes(".lovable.dev") ||
    o.includes("lovableproject.com") ||
    o.includes("id.lovable.app") ||
    o.match(/https:\/\/[a-z0-9-]+\.lovableproject\.com/) ||
    o.match(/https:\/\/[a-z0-9-]+--[a-z0-9-]+\.lovable\.app/) ||
    o.match(/https:\/\/[a-z0-9-]+\.lovable\.dev/)
  ) {
    return true;
  }

  // Allow localhost for development
  if (o.startsWith("http://localhost:") || o.startsWith("http://127.0.0.1:")) {
    return true;
  }

  return ALLOWED_ORIGINS.includes(o);
};

const getCorsHeaders = (origin: string | null) => ({
  // Important: always echo the request Origin so browsers don't fail the request
  // with a generic "Failed to fetch" due to preflight mismatch.
  // We still enforce the real origin allowlist below before doing any work.
  "Access-Control-Allow-Origin": origin ?? "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

// Whitelist of allowed voice IDs - only the custom "advogado de joao santaroza" voice
const ALLOWED_VOICE_IDS = ["yfy5M61ODLwWnWbM7u5R"];

// Rate limit configuration
const RATE_LIMIT_MAX = 10; // Max requests per window
const RATE_LIMIT_WINDOW_MINUTES = 60; // 1 hour window

// Cache bucket name
const CACHE_BUCKET = "tts-cache";

// Input validation schema
const RequestSchema = z.object({
  text: z.string()
    .min(1, "Text cannot be empty")
    .max(10000, "Text exceeds maximum length"),
  voiceId: z.string()
    .min(1, "VoiceId is required")
    .max(50, "VoiceId too long"),
});

// Generic error messages for clients (security: don't expose internal details)
const CLIENT_ERRORS = {
  GENERIC: "Falha ao gerar áudio. Por favor, tente novamente.",
  RATE_LIMIT: "Muitas solicitações. Por favor, aguarde alguns minutos.",
  UNAUTHORIZED: "Acesso não autorizado.",
  INVALID_INPUT: "Dados de entrada inválidos.",
  VOICE_NOT_ALLOWED: "Voz não autorizada.",
  TEXT_TOO_SHORT: "Texto muito curto para gerar áudio.",
  TIMEOUT: "Tempo limite excedido. Por favor, tente novamente.",
};

// Generate MD5 hash for cache key
async function generateHash(text: string, voiceId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${voiceId}:${text}`);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = new Uint8Array(hashBuffer);
  const hexBytes = encodeHex(hashArray);
  const decoder = new TextDecoder();
  return decoder.decode(hexBytes);
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Verify origin
    if (!isAllowedOrigin(origin)) {
      console.error("Blocked request from unauthorized origin:", origin);
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";

    const authHeader = req.headers.get("Authorization");
    const apiKeyHeader = (req.headers.get("apikey") || req.headers.get("x-api-key"))?.trim() || null;

    // Initialize backend clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Backend configuration missing");
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Authorization check:
    // This is a public endpoint (no user login required).
    // Security is provided by:
    // 1. Origin validation (CORS) - only allowed domains can call
    // 2. Rate limiting per IP - prevents abuse
    // 3. Voice ID whitelist - only approved voices can be used
    // 4. Input validation - prevents injection attacks
    // 
    // We require an Authorization header or apikey header to be present
    // (any value) to ensure the request is intentional and not from a random crawler.
    const hasAuthHeader = authHeader && authHeader.length > 0;
    const hasApiKey = apiKeyHeader && apiKeyHeader.length > 0;

    if (!hasAuthHeader && !hasApiKey) {
      console.error("No authorization credentials provided");
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Use service role for rate limit check and storage (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check content-length to prevent oversized payloads
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 50000) {
      console.error("Payload too large:", contentLength);
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.INVALID_INPUT }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Validate input with Zod schema
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.INVALID_INPUT }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, voiceId } = validationResult.data;

    // Validate voiceId against whitelist
    if (!ALLOWED_VOICE_IDS.includes(voiceId)) {
      console.error("Unauthorized voice ID attempted:", voiceId, "from IP:", clientIP);
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.VOICE_NOT_ALLOWED }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean and prepare text - remove HTML tags and limit length
    const cleanText = text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")    // Normalize whitespace
      .trim()
      .slice(0, 5000);         // ElevenLabs limit

    if (!cleanText || cleanText.length < 10) {
      console.error("Text too short after cleaning:", cleanText.length);
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.TEXT_TOO_SHORT }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate cache key based on text and voice
    const cacheKey = await generateHash(cleanText, voiceId);
    const cacheFileName = `audio_${cacheKey}.mp3`;

    console.log(`TTS Request: ${cleanText.length} chars, voice ${voiceId}, cache key ${cacheKey}`);

    // Check if audio exists in cache
    const { data: cachedFile } = await supabaseAdmin.storage
      .from(CACHE_BUCKET)
      .list("", { search: cacheFileName });

    if (cachedFile && cachedFile.length > 0) {
      // Audio exists in cache - return public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(CACHE_BUCKET)
        .getPublicUrl(cacheFileName);

      if (urlData?.publicUrl) {
        console.log(`Cache HIT: ${cacheFileName} - returning cached audio (0 credits used)`);
        
        return new Response(
          JSON.stringify({ 
            cached: true, 
            url: urlData.publicUrl 
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    console.log(`Cache MISS: ${cacheFileName} - generating new audio`);

    // Check persistent rate limit (only for new generations, not cached)
    const { data: isAllowed, error: rateLimitError } = await supabaseAdmin.rpc(
      "check_tts_rate_limit",
      { 
        p_ip_address: clientIP,
        p_max_requests: RATE_LIMIT_MAX,
        p_window_minutes: RATE_LIMIT_WINDOW_MINUTES
      }
    );

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError.message);
      // Don't block on rate limit DB errors, but log for monitoring
    } else if (!isAllowed) {
      console.warn("Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.RATE_LIMIT }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call ElevenLabs API with timeout - using Flash model for faster/cheaper generation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_22050_32`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: "eleven_flash_v2_5", // Flash model - faster and cheaper
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.8,
              style: 0.3,
              use_speaker_boost: true,
              speed: 1.15,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBytes = new Uint8Array(audioBuffer);

      console.log(`Generated: ${audioBuffer.byteLength} bytes for IP ${clientIP}`);

      // Save to cache for future requests
      const { error: uploadError } = await supabaseAdmin.storage
        .from(CACHE_BUCKET)
        .upload(cacheFileName, audioBytes, {
          contentType: "audio/mpeg",
          cacheControl: "31536000", // Cache for 1 year
          upsert: false, // Don't overwrite if exists
        });

      if (uploadError) {
        console.error("Cache upload failed:", uploadError.message);
        // Continue anyway - just return the audio directly
      } else {
        console.log(`Cached: ${cacheFileName} saved to storage`);
      }

      // Return audio directly
      return new Response(audioBuffer, {
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("ElevenLabs API timeout");
        return new Response(
          JSON.stringify({ error: CLIENT_ERRORS.TIMEOUT }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    // Log detailed error server-side only
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("TTS Error:", errorMessage);
    
    // Return generic error to client (security: don't expose internal details)
    return new Response(
      JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
