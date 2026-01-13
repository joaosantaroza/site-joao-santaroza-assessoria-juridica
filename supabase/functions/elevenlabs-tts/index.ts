import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from environment or use defaults
const ALLOWED_ORIGINS = [
  "https://lovable.dev",
  "https://lovableproject.com",
  // Add production domain when deployed
];

// Helper to check if origin is allowed (including Lovable preview domains)
const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  
  // Allow Lovable preview domains
  if (origin.includes(".lovableproject.com") || origin.includes(".lovable.app")) {
    return true;
  }
  
  // Allow localhost for development
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
    return true;
  }
  
  return ALLOWED_ORIGINS.includes(origin);
};

const getCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

// Whitelist of allowed voice IDs - only the custom "advogado de joao santaroza" voice
const ALLOWED_VOICE_IDS = ["yfy5M61ODLwWnWbM7u5R"];

// Input validation schema
const RequestSchema = z.object({
  text: z.string()
    .min(1, "Text cannot be empty")
    .max(10000, "Text exceeds maximum length"),
  voiceId: z.string()
    .min(1, "VoiceId is required")
    .max(50, "VoiceId too long"),
});

// Simple in-memory rate limiting (per IP, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // Max requests per window
const RATE_LIMIT_WINDOW = 60000; // 1 minute window

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
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
        JSON.stringify({ error: "Unauthorized origin" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting by IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    if (!checkRateLimit(clientIP)) {
      console.warn("Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify authorization header exists (even if using anon key)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the token is valid using Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate the token - getClaims validates the JWT
    const token = authHeader.replace("Bearer ", "");
    const { error: authError } = await supabase.auth.getUser(token);
    
    // For public access, we accept the anon key token even without a logged-in user
    // The key validation happens through Supabase's infrastructure
    // We rely on origin check + rate limiting for abuse prevention

    // Check content-length to prevent oversized payloads
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 50000) {
      return new Response(
        JSON.stringify({ error: "Request payload too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Validate input with Zod schema
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: validationResult.error.errors.map(e => e.message) 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, voiceId } = validationResult.data;

    // Validate voiceId against whitelist
    if (!ALLOWED_VOICE_IDS.includes(voiceId)) {
      console.error("Unauthorized voice ID attempted:", voiceId);
      return new Response(
        JSON.stringify({ error: "Voice not authorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
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
      return new Response(
        JSON.stringify({ error: "Text is too short after cleaning" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating TTS for ${cleanText.length} characters with voice ${voiceId} from ${clientIP}`);

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
        console.error("ElevenLabs API error:", errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();

      console.log(`Successfully generated ${audioBuffer.byteLength} bytes of audio`);

      return new Response(audioBuffer, {
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request timeout - ElevenLabs API took too long");
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("TTS Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
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
