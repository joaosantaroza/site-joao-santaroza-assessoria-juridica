import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Helper to check if origin is allowed (including Lovable preview domains)
const isAllowedOrigin = (origin: string | null): boolean => {
  const o = origin?.trim();
  if (!o) return false;
  if (o === "null") return true;
  const allowed = [
    'https://joaosantarozaadvocacia.com.br',
    'https://www.joaosantarozaadvocacia.com.br',
    'https://advise-flow-assist.lovable.app',
  ];
  if (allowed.includes(o)) return true;
  if (/^https:\/\/.*\.lovable\.app$/.test(o)) return true;
  if (/^https:\/\/.*\.lovableproject\.com$/.test(o)) return true;
  if (/^https:\/\/.*\.lovable\.dev$/.test(o)) return true;
  if (o.startsWith("http://localhost:") || o.startsWith("http://127.0.0.1:")) return true;
  return false;
};

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify origin BEFORE processing to prevent credit abuse
    if (!isAllowedOrigin(origin)) {
      console.error("Blocked request from unauthorized origin:", origin);
      return new Response(
        JSON.stringify({ error: 'Acesso não autorizado.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Verify authorization header exists
    const authHeader = req.headers.get('Authorization');
    const apiKeyHeader = req.headers.get('apikey');

    if (!authHeader && !apiKeyHeader) {
      console.error('No authorization credentials provided');
      return new Response(
        JSON.stringify({ error: 'Acesso não autorizado.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is admin using Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim();
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Backend configuration missing');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth token to verify permissions
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '', {
      global: { headers: { Authorization: authHeader || `Bearer ${apiKeyHeader}` } }
    });

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error('User authentication failed:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role using service role client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasRole, error: roleError } = await supabaseAdmin.rpc(
      'has_role',
      { _user_id: userData.user.id, _role: 'admin' }
    );

    if (roleError) {
      console.error('Role check error:', roleError.message);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!hasRole) {
      console.error('User is not admin:', userData.user.id);
      return new Response(
        JSON.stringify({ error: 'Permissão negada. Apenas administradores podem regenerar imagens.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { title, category, imageStyle = 'photographic', format = 'blog', slideType } = await req.json();

    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Título inválido. Mínimo de 5 caracteres.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Serviço de geração de imagem não configurado.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${userData.user.email} regenerating cover image (style: ${imageStyle}) for: ${title}`);

    // Create a prompt for the cover image based on article theme
    const categoryKeywords: Record<string, string> = {
      'Isenção Fiscal': 'tax documents, money, medical reports, health justice',
      'Trabalho': 'workplace, workers, labor rights, employment',
      'Previdenciário': 'retirement, pension, elderly care, INSS',
      'Civil': 'contracts, family, property, legal documents',
      'Tributário': 'taxes, finances, calculator, money',
      'Geral': 'law, justice, legal documents, professional office'
    };

    // Get the first category or default to 'Geral'
    const primaryCategory = Array.isArray(category) ? category[0] : (category || 'Geral');
    const categoryHint = categoryKeywords[primaryCategory] || categoryKeywords['Geral'];

    // Style-specific instructions
    const styleInstructions: Record<string, string> = {
      'abstract': 'Abstract art style with geometric shapes, flowing gradients, and symbolic representations. Modern minimalist design with bold colors and clean lines. No realistic elements, purely conceptual and artistic.',
      'photographic': 'Photorealistic professional stock photo style. Ultra high resolution, crisp details, natural lighting. Real-world objects and scenes that look like professional photography.',
      'illustration': 'Digital illustration style with artistic rendering. Vector-like clean lines, stylized elements, flat design with subtle shadows. Modern corporate illustration aesthetic.',
    };

    const selectedStyle = styleInstructions[imageStyle] || styleInstructions['photographic'];

    // Image prompt optimized for the chosen format
    const isSocial = format === 'social';
    const isSlide = format === 'slide';
    let formatInstruction: string;
    let contextLabel: string;

    if (isSlide) {
      const slideLabel = slideType === 'capa' ? 'cover slide' : slideType === 'cta' ? 'call-to-action slide' : 'content slide';
      formatInstruction = `Square 1:1 aspect ratio Instagram carousel ${slideLabel}. MANDATORY: Dark navy blue background (#041E42). Subtle bronze/gold (#B8945A) accent lines or geometric elements. Clean, minimal, professional design. The image is a background for text overlay — leave the center area relatively clean for readability.`;
      contextLabel = `Instagram carousel ${slideLabel}`;
    } else if (isSocial) {
      formatInstruction = 'Square 1:1 aspect ratio Instagram post image. Bold, eye-catching, designed for social media feed.';
      contextLabel = 'Instagram post';
    } else {
      formatInstruction = 'Wide 16:9 aspect ratio blog cover image.';
      contextLabel = 'blog header';
    }

    const imagePrompt = `Professional, modern ${contextLabel} image for a Brazilian law firm article about: "${title}". 
Art Style: ${selectedStyle}
Design: ${isSlide ? 'Dark navy blue (#041E42) background with bronze/gold (#B8945A) accents.' : 'Clean, professional, corporate design with subtle blue and gold accents.'} 
Elements: ${categoryHint}. 
Mood: Trustworthy, professional, accessible. 
Format: ${formatInstruction} 
NO text, NO logos, NO people faces. ${imageStyle === 'abstract' ? 'Abstract or symbolic representation.' : 'Professional visual representation.'}
Ultra high resolution.`;

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: imagePrompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Image generation failed:', imageResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar imagem. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageData = await imageResponse.json();
    const generatedImageBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageBase64) {
      console.error('No image in response');
      return new Response(
        JSON.stringify({ error: 'Nenhuma imagem foi gerada. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image generated successfully, uploading to storage...');

    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = generatedImageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split('-')[0];
    const imagePath = `covers/${timestamp}-${randomId}.png`;

    // Upload to blog-images bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from('blog-images')
      .upload(imagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Failed to upload cover image:', uploadError.message);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar imagem. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('blog-images')
      .getPublicUrl(imagePath);

    const coverImageUrl = publicUrlData?.publicUrl || null;
    console.log('Cover image uploaded successfully:', coverImageUrl);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          coverImageUrl: coverImageUrl,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error regenerating cover image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
