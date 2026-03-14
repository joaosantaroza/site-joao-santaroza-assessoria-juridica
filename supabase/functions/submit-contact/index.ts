import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const isAllowedOrigin = (origin: string | null): boolean => {
  const o = origin?.trim();
  if (!o) return false;
  if (o === "null") return true;
  if (
    o.includes(".lovableproject.com") ||
    o.includes(".lovable.app") ||
    o.includes(".lovable.dev") ||
    o.match(/https:\/\/[a-z0-9-]+\.lovableproject\.com/) ||
    o.match(/https:\/\/[a-z0-9-]+--[a-z0-9-]+\.lovable\.app/) ||
    o.match(/https:\/\/[a-z0-9-]+\.lovable\.dev/)
  ) return true;
  if (o.startsWith("http://localhost:") || o.startsWith("http://127.0.0.1:")) return true;
  const allowed = [
    "https://lovable.dev",
    "https://lovableproject.com",
    "https://joaosantarozaadvocacia.com.br",
    "https://www.joaosantarozaadvocacia.com.br",
  ];
  return allowed.includes(o);
};

const getCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin ?? "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  phone: z.string().trim().min(10, "Telefone inválido").max(20, "Telefone muito longo")
    .regex(/^[\d\s\-()+ ]+$/, "Telefone deve conter apenas números"),
  message: z.string().max(1000, "Mensagem muito longa").optional().or(z.literal("")),
  subject: z.string().max(200, "Assunto muito longo").optional().or(z.literal("")),
});

const CLIENT_ERRORS = {
  GENERIC: "Falha ao processar. Por favor, tente novamente.",
  RATE_LIMIT: "Muitas solicitações. Por favor, aguarde alguns minutos.",
  UNAUTHORIZED: "Acesso não autorizado.",
  INVALID_INPUT: "Dados de entrada inválidos.",
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    // Origin check
    if (!isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Content-length guard
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10000) {
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INVALID_INPUT }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Parse and validate input
    const body = await req.json();
    const validation = ContactSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error.errors[0]?.message || CLIENT_ERRORS.INVALID_INPUT }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { name, phone, message, subject } = validation.data;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limit check (reuse appointment rate limiter)
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || "unknown";

    const { data: isAllowed, error: rlError } = await supabase.rpc(
      "check_appointment_rate_limit",
      { p_ip_address: clientIP, p_max_requests: 5, p_window_minutes: 60 }
    );

    if (!rlError && !isAllowed) {
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.RATE_LIMIT }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Save as appointment with status 'contact'
    const { error } = await supabase.from('appointments').insert({
      name: name.trim(),
      phone: phone.replace(/\D/g, ""),
      message: message?.trim() || null,
      practice_area: subject?.trim() || 'Consulta Jurídica',
      preferred_date: new Date().toISOString().split('T')[0],
      preferred_time: 'A definir',
      status: 'contact',
    });

    if (error) {
      console.error('Error saving contact:', error.message);
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create admin notification
    await supabase.from('admin_notifications').insert({
      type: 'contact',
      title: 'Novo contato via WhatsApp',
      message: `${name.trim()} entrou em contato sobre: ${subject?.trim() || 'Consulta Jurídica'}`,
      data: { name: name.trim(), phone: phone.replace(/\D/g, ""), subject, message },
    });

    console.log(`Contact saved: ${name.trim()} - ${subject || 'Consulta Jurídica'}`);

    return new Response(JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error('Contact error:', err instanceof Error ? err.message : 'Unknown');
    return new Response(JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
