import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  'https://joaosantarozaadvocacia.com.br',
  'https://www.joaosantarozaadvocacia.com.br',
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (origin === 'null') return true;
  if (origin.includes('.lovable.dev') || origin.includes('.lovableproject.com') || origin.includes('.lovable.app')) return true;
  if (origin.startsWith('http://localhost:')) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Origin validation
    const origin = req.headers.get('origin');
    if (!isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: 'Unauthorized origin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Whitelist: only allow Supabase storage URLs
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const allowedPrefix = `${supabaseUrl}/storage/v1/object/public/`;
    if (!url.startsWith(allowedPrefix)) {
      return new Response(JSON.stringify({ error: 'Only storage URLs are allowed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let imageResponse: Response;
    try {
      imageResponse = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'Request timeout' }), {
          status: 504,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw error;
    }

    if (!imageResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
        status: imageResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const blob = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return new Response(blob, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="post-cover.jpg"',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
