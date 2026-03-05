import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { lead_type, lead_id, lead_name, lead_phone, practice_area } = await req.json();

    if (!lead_type || !lead_id || !lead_name || !lead_phone || !practice_area) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const followUps = [
      { step: 1, daysFromNow: 1 },
      { step: 2, daysFromNow: 3 },
      { step: 3, daysFromNow: 7 },
    ];

    const records = followUps.map(({ step, daysFromNow }) => {
      const date = new Date(now);
      date.setDate(date.getDate() + daysFromNow);
      return {
        lead_type,
        lead_id,
        lead_name,
        lead_phone: lead_phone.replace(/\D/g, ''),
        practice_area,
        follow_up_date: date.toISOString().split('T')[0],
        sequence_step: step,
        status: 'pending',
      };
    });

    const { error: insertError } = await supabaseAdmin
      .from('follow_ups')
      .insert(records);

    if (insertError) {
      console.error("Failed to create follow-up sequence:", insertError.message);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin notification
    await supabaseAdmin.from('admin_notifications').insert({
      type: 'follow_up',
      title: 'Novo Follow-up Criado',
      message: `Sequência de follow-up criada para ${lead_name} (${practice_area}). Primeiro contato amanhã.`,
      data: { lead_name, lead_phone, practice_area, lead_type },
    });

    console.log(`Follow-up sequence created for ${lead_name} (${practice_area})`);

    return new Response(JSON.stringify({ success: true, count: records.length }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown");
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
