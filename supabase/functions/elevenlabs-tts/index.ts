import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from environment or use defaults
const ALLOWED_ORIGINS = [
  "https://lovable.dev",
  "https://lovableproject.com",
];

// Helper to check if origin is allowed (including Lovable preview domains)
const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  
  // Allow Lovable preview domains (various formats)
  if (
    origin.includes(".lovableproject.com") || 
    origin.includes(".lovable.app") ||
    origin.includes("lovableproject.com") ||
    origin.includes("id.lovable.app") ||
    origin.match(/https:\/\/[a-z0-9-]+\.lovableproject\.com/) ||
    origin.match(/https:\/\/[a-z0-9-]+--[a-z0-9-]+\.lovable\.app/)
  ) {
    return true;
  }
  
  // Allow localhost for development
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
    return true;
  }
  
  return ALLOWED_ORIGINS.includes(origin);
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

    // Capture caller credentials (public site, no user login)
    const authHeader = req.headers.get("Authorization");
    const apiKeyHeader = req.headers.get("apikey") || req.headers.get("x-api-key");

    // Initialize backend clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Backend configuration missing");
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate request authorization.
    // This endpoint is public (no user login), so we require the project's public key.
    // The frontend can send it via either `Authorization: Bearer <anon>` or `apikey: <anon>`.
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : null;

    const isAuthorized =
      (bearerToken && bearerToken === supabaseAnonKey) ||
      (apiKeyHeader && apiKeyHeader === supabaseAnonKey);

    if (!isAuthorized) {
      console.error("Unauthorized request (missing/invalid public key)");
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Use service role for rate limit check (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check persistent rate limit
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

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    console.log(`Generating TTS: ${cleanText.length} chars, voice ${voiceId}, IP ${clientIP}`);

    // Call ElevenLabs API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.8,
              style: 0.3,
              use_speaker_boost: true,
              speed: 1.0,
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

      console.log(`Success: ${audioBuffer.byteLength} bytes generated for IP ${clientIP}`);

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
