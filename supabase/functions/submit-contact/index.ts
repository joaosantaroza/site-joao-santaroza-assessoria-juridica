import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, message, subject } = await req.json();

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: 'name and phone are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Save as appointment with status 'contact'
    const { error } = await supabase.from('appointments').insert({
      name,
      phone,
      message: message || null,
      practice_area: subject || 'Consulta Jurídica',
      preferred_date: new Date().toISOString().split('T')[0],
      preferred_time: 'A definir',
      status: 'contact',
    });

    if (error) {
      console.error('Error saving contact:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create admin notification
    await supabase.from('admin_notifications').insert({
      type: 'contact',
      title: 'Novo contato via WhatsApp',
      message: `${name} entrou em contato sobre: ${subject || 'Consulta Jurídica'}`,
      data: { name, phone, subject, message },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
