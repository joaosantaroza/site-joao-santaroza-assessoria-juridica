import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  if (o === "null") return true;

  // Allow Lovable preview domains
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
  "Access-Control-Allow-Origin": origin ?? "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

// Rate limit configuration
const RATE_LIMIT_MAX = 5; // Max leads per window
const RATE_LIMIT_WINDOW_MINUTES = 60; // 1 hour window

// Legacy allowed ebook IDs (for backwards compatibility with old static eBooks)
const LEGACY_EBOOK_IDS = [
  "isencao-ir-hiv",
  "estabilidade-gestante",
  "ponto-britanico",
];

// Input validation schema (server-side validation)
const RequestSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z.string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo")
    .optional(),
  phone: z.string()
    .trim()
    .min(10, "Telefone inválido")
    .max(20, "Telefone muito longo")
    .regex(/^[\d\s\-()+ ]+$/, "Telefone deve conter apenas números"),
  ebook_id: z.string()
    .min(1, "ebook_id é obrigatório")
    .max(100, "ebook_id muito longo"),
  ebook_title: z.string()
    .min(1, "ebook_title é obrigatório")
    .max(200, "ebook_title muito longo"),
});

// Generic error messages for clients
const CLIENT_ERRORS = {
  GENERIC: "Falha ao processar. Por favor, tente novamente.",
  RATE_LIMIT: "Muitas solicitações. Por favor, aguarde alguns minutos.",
  UNAUTHORIZED: "Acesso não autorizado.",
  INVALID_INPUT: "Dados de entrada inválidos.",
  INVALID_EBOOK: "E-book não reconhecido.",
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

    // Check content-length to prevent oversized payloads
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10000) {
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
      const firstError = validationResult.error.errors[0];
      return new Response(
        JSON.stringify({ error: firstError?.message || CLIENT_ERRORS.INVALID_INPUT }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email, phone, ebook_id, ebook_title } = validationResult.data;

    // Use service role for rate limit check and insert (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if ebook_id is valid (either legacy or dynamic from database)
    const isLegacyEbook = LEGACY_EBOOK_IDS.includes(ebook_id);
    let ebookPdfPath: string | null = null;
    
    if (!isLegacyEbook) {
      // For dynamic eBooks, verify the ID exists in blog_posts with has_ebook = true
      const { data: blogPost, error: blogError } = await supabaseAdmin
        .from("blog_posts")
        .select("id, has_ebook, ebook_pdf_url")
        .eq("id", ebook_id)
        .eq("has_ebook", true)
        .maybeSingle();
      
      if (blogError || !blogPost) {
        console.error("Invalid dynamic ebook ID:", ebook_id, blogError?.message);
        return new Response(
          JSON.stringify({ error: CLIENT_ERRORS.INVALID_EBOOK }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Extract the file path from the full URL for dynamic eBooks
      if (blogPost.ebook_pdf_url) {
        // URL format: https://xxx.supabase.co/storage/v1/object/public/ebooks/path/to/file.pdf
        const urlMatch = blogPost.ebook_pdf_url.match(/\/storage\/v1\/object\/public\/ebooks\/(.+)$/);
        if (urlMatch) {
          ebookPdfPath = urlMatch[1];
        }
      }
    }

    // Check rate limit
    const { data: isAllowed, error: rateLimitError } = await supabaseAdmin.rpc(
      "check_ebook_lead_rate_limit",
      { 
        p_ip_address: clientIP,
        p_max_requests: RATE_LIMIT_MAX,
        p_window_minutes: RATE_LIMIT_WINDOW_MINUTES
      }
    );

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError.message);
      // Continue anyway - don't block on rate limit DB errors
    } else if (!isAllowed) {
      console.warn("Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.RATE_LIMIT }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert lead using service role (bypasses RLS)
    const { error: insertError } = await supabaseAdmin
      .from("ebook_leads")
      .insert({
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone.replace(/\D/g, ""), // Store only digits
        ebook_id,
        ebook_title,
      });

    if (insertError) {
      console.error("Failed to insert lead:", insertError.message);
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Lead submitted: ${ebook_id} from IP ${clientIP}${email ? ` (${email})` : ""}`);

    // Create follow-up sequence (fire and forget)
    try {
      const { data: insertedLead } = await supabaseAdmin
        .from("ebook_leads")
        .select("id")
        .eq("phone", phone.replace(/\D/g, ""))
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (insertedLead) {
        await fetch(`${supabaseUrl}/functions/v1/create-follow-up-sequence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            lead_type: "ebook",
            lead_id: insertedLead.id,
            lead_name: name.trim(),
            lead_phone: phone.replace(/\D/g, ""),
            practice_area: ebook_title,
          }),
        });
      }
    } catch (followUpErr) {
      console.error("Follow-up creation failed (non-blocking):", followUpErr);
    }

    // Generate signed URL for the ebook download (valid for 1 hour)
    let signedUrl: string | null = null;
    const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

    if (ebookPdfPath) {
      // Dynamic eBook from storage
      const { data: signedData, error: signedError } = await supabaseAdmin.storage
        .from("ebooks")
        .createSignedUrl(ebookPdfPath, SIGNED_URL_EXPIRY_SECONDS);

      if (signedError) {
        console.error("Failed to generate signed URL:", signedError.message);
        // Return success anyway - client can fall back to direct URL
      } else {
        signedUrl = signedData.signedUrl;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        signed_url: signedUrl, // Will be null for legacy ebooks or if generation fails
        expires_in: signedUrl ? SIGNED_URL_EXPIRY_SECONDS : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Lead submission error:", errorMessage);
    
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
