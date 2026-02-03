import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
};

// Generic error messages for clients
const CLIENT_ERRORS = {
  UNAUTHORIZED: "Acesso não autorizado.",
  FORBIDDEN: "Você não tem permissão para acessar este recurso.",
  SERVER_ERROR: "Erro interno do servidor.",
  NOT_FOUND: "Registro não encontrado.",
  INVALID_REQUEST: "Requisição inválida.",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Backend configuration missing");
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.SERVER_ERROR }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create auth client to validate the user's token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate JWT and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Invalid JWT:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    if (!userId) {
      console.error("No user ID in token");
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.UNAUTHORIZED }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to check admin status (bypasses RLS on user_roles)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.warn("Non-admin user attempted to access leads:", userId);
      return new Response(
        JSON.stringify({ error: CLIENT_ERRORS.FORBIDDEN }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse URL to get action
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const action = pathParts[pathParts.length - 1] || "";

    // Handle GET - List all leads
    if (req.method === "GET") {
      const { data: leads, error: leadsError } = await supabaseAdmin
        .from("ebook_leads")
        .select("id, name, phone, email, ebook_id, ebook_title, created_at")
        .order("created_at", { ascending: false });

      if (leadsError) {
        console.error("Failed to fetch leads:", leadsError.message);
        return new Response(
          JSON.stringify({ error: CLIENT_ERRORS.SERVER_ERROR }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Admin ${userId} fetched ${leads?.length || 0} leads`);

      return new Response(
        JSON.stringify({ data: leads }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle DELETE - Delete a lead
    if (req.method === "DELETE") {
      const body = await req.json().catch(() => ({}));
      const leadId = body.id;

      if (!leadId || typeof leadId !== "string") {
        return new Response(
          JSON.stringify({ error: CLIENT_ERRORS.INVALID_REQUEST }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(leadId)) {
        return new Response(
          JSON.stringify({ error: CLIENT_ERRORS.INVALID_REQUEST }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: deleteError, count } = await supabaseAdmin
        .from("ebook_leads")
        .delete()
        .eq("id", leadId);

      if (deleteError) {
        console.error("Failed to delete lead:", deleteError.message);
        return new Response(
          JSON.stringify({ error: CLIENT_ERRORS.SERVER_ERROR }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Admin ${userId} deleted lead ${leadId}`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin leads error:", errorMessage);

    return new Response(
      JSON.stringify({ error: CLIENT_ERRORS.SERVER_ERROR }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
