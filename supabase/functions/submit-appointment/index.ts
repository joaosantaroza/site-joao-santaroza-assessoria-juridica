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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

const RequestSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  phone: z.string().trim().min(10, "Telefone inválido").max(20, "Telefone muito longo")
    .regex(/^[\d\s\-()+ ]+$/, "Telefone deve conter apenas números"),
  email: z.string().trim().email("Email inválido").max(255).optional().or(z.literal("")),
  practice_area: z.string().trim().min(1, "Área obrigatória").max(200),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  preferred_time: z.string().min(1, "Horário obrigatório").max(10),
  message: z.string().max(1000, "Mensagem muito longa").optional().or(z.literal("")),
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
    if (!isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || "unknown";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10000) {
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.INVALID_INPUT }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error.errors[0]?.message || CLIENT_ERRORS.INVALID_INPUT }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { name, phone, email, practice_area, preferred_date, preferred_time, message } = validation.data;

    // Validate date is in the future
    const dateObj = new Date(preferred_date + "T12:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return new Response(JSON.stringify({ error: "A data deve ser futura." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limit check
    const { data: isAllowed, error: rlError } = await supabaseAdmin.rpc(
      "check_appointment_rate_limit",
      { p_ip_address: clientIP, p_max_requests: 3, p_window_minutes: 60 }
    );

    if (!rlError && !isAllowed) {
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.RATE_LIMIT }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Insert appointment
    const { error: insertError } = await supabaseAdmin.from("appointments").insert({
      name: name.trim(),
      phone: phone.replace(/\D/g, ""),
      email: email?.trim() || null,
      practice_area,
      preferred_date,
      preferred_time,
      message: message?.trim() || null,
    });

    if (insertError) {
      console.error("Insert error:", insertError.message);
      return new Response(JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create admin notification
    await supabaseAdmin.from("admin_notifications").insert({
      type: "appointment",
      title: "Novo Agendamento",
      message: `${name.trim()} agendou para ${preferred_date} às ${preferred_time} - ${practice_area}`,
      data: { name: name.trim(), phone: phone.replace(/\D/g, ""), practice_area, preferred_date, preferred_time },
    });

    console.log(`Appointment created: ${practice_area} on ${preferred_date} at ${preferred_time}`);

    // Create follow-up sequence (fire and forget)
    try {
      const { data: insertedApt } = await supabaseAdmin
        .from("appointments")
        .select("id")
        .eq("phone", phone.replace(/\D/g, ""))
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (insertedApt) {
        await fetch(`${supabaseUrl}/functions/v1/create-follow-up-sequence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            lead_type: "appointment",
            lead_id: insertedApt.id,
            lead_name: name.trim(),
            lead_phone: phone.replace(/\D/g, ""),
            practice_area,
          }),
        });
      }
    } catch (followUpErr) {
      console.error("Follow-up creation failed (non-blocking):", followUpErr);
    }

    return new Response(JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    console.error("Appointment error:", error instanceof Error ? error.message : "Unknown");
    return new Response(JSON.stringify({ error: CLIENT_ERRORS.GENERIC }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
