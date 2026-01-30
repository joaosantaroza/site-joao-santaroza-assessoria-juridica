import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://lovable.dev",
  "https://lovableproject.com",
  "https://joaosantarozaadvocacia.com.br",
  "https://www.joaosantarozaadvocacia.com.br",
];

// Helper to check if origin is allowed (including Lovable preview domains)
const isAllowedOrigin = (origin: string | null): boolean => {
  const o = origin?.trim();
  if (!o) return false;

  // In some sandboxed preview iframes the browser sends Origin: null.
  if (o === "null") return true;

  // Allow Lovable preview domains (various formats)
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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Verify origin BEFORE processing to prevent credit abuse
    if (!isAllowedOrigin(origin)) {
      console.error("Blocked request from unauthorized origin:", origin);
      return new Response(
        JSON.stringify({ error: "Acesso não autorizado." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify authorization header exists
    const authHeader = req.headers.get("Authorization");
    const apiKeyHeader = req.headers.get("apikey");

    if (!authHeader && !apiKeyHeader) {
      console.error("No authorization credentials provided");
      return new Response(
        JSON.stringify({ error: "Acesso não autorizado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is admin using Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Backend configuration missing");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth token to verify permissions
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      global: { headers: { Authorization: authHeader || `Bearer ${apiKeyHeader}` } }
    });

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error("User authentication failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin role using service role client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasRole, error: roleError } = await supabaseAdmin.rpc(
      "has_role",
      { _user_id: userData.user.id, _role: "admin" }
    );

    if (roleError) {
      console.error("Role check error:", roleError.message);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar permissões." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasRole) {
      console.error("User is not admin:", userData.user.id);
      return new Response(
        JSON.stringify({ error: "Permissão negada. Apenas administradores podem formatar artigos." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { pdfText, title, tone = 'acessivel' } = await req.json();
    
    if (!pdfText || typeof pdfText !== "string" || pdfText.trim().length < 100) {
      return new Response(
        JSON.stringify({ error: "Texto do PDF inválido. O conteúdo deve ter pelo menos 100 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: "Título inválido. Mínimo de 5 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate tone
    const validTones = ['formal', 'acessivel', 'tecnico'];
    const selectedTone = validTones.includes(tone) ? tone : 'acessivel';

    // Use Lovable AI API
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${userData.user.email} formatting PDF article (tone: ${selectedTone}) for title: ${title}`);

    // Tone-specific instructions for blog-style articles
    const toneInstructions = {
      formal: `ESTILO DE ESCRITA:
- Use linguagem clara mas com tom profissional
- Mantenha formalidade sem ser rebuscado
- Evite jargões excessivos, prefira explicar conceitos
- Estruture de forma organizada e elegante`,
      acessivel: `ESTILO DE ESCRITA:
- Use linguagem simples e direta, como uma conversa
- Explique tudo como se falasse com um amigo leigo
- Use exemplos práticos do cotidiano
- Parágrafos curtos e fáceis de ler
- Priorize clareza acima de tudo`,
      tecnico: `ESTILO DE ESCRITA:
- Seja detalhado mas sem exagerar em citações
- Mencione artigos de lei quando essencial, de forma natural
- Foque em explicar o "porquê" das regras
- Equilibre profundidade com legibilidade`,
    };

    const systemPrompt = `Você é um redator especializado em formatar e adaptar conteúdo jurídico para artigos de BLOG informativos.

TAREFA:
Você receberá o texto extraído de um PDF jurídico. Sua função é REFORMATAR e ADAPTAR este conteúdo para que fique consistente com o estilo de um blog jurídico profissional.

IMPORTANTE:
- PRESERVE o conteúdo original e informações do PDF
- REFORMATE para o estilo de blog informativo
- MELHORE a estrutura e organização do texto
- REMOVA elementos que não fazem sentido em blog (cabeçalhos de documento, numerações burocráticas, etc.)
- MANTENHA as informações jurídicas precisas

${toneInstructions[selectedTone as keyof typeof toneInstructions]}

REGRAS DE FORMATAÇÃO HTML:
- Use <h2> para títulos de seção (nunca <h1>)
- Use <h3> para subtítulos quando necessário
- Use <p> para parágrafos com class="text-justify"
- Use <ul> e <li> para listas quando apropriado
- Use <blockquote> para destaques importantes
- Use <strong> para termos importantes
- Mantenha parágrafos curtos e escaneáveis

CONTEXTO DO ESCRITÓRIO:
- O escritório é do Dr. João Victor Santaroza, OAB/PR 81.381
- Atua com isenção de IR, direitos trabalhistas e previdenciários
- Localizado no Paraná, com atuação digital em todo Brasil`;

    const userPrompt = `Reformate o seguinte conteúdo de PDF para um artigo de blog com o título "${title}":

---
CONTEÚDO DO PDF:
${pdfText.substring(0, 15000)}
---

Retorne a resposta APENAS no seguinte formato JSON válido (sem texto adicional antes ou depois):
{
  "content": "<HTML formatado do artigo>",
  "excerpt": "Resumo curto do artigo (máximo 200 caracteres)",
  "category": "Categoria sugerida (Isenção Fiscal, Trabalho, Previdenciário, etc.)"
}`;

    // Call Lovable AI API
    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: "Erro de autenticação com o serviço de IA." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao formatar conteúdo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const rawContent = aiResponse.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Resposta vazia da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received, parsing JSON...");

    // Try to parse JSON from the response
    let parsed;
    try {
      // Remove markdown code blocks if present (```json ... ```)
      let cleanedContent = rawContent.trim();
      
      // Handle markdown code blocks with or without language identifier
      const jsonMatch = cleanedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }
      
      parsed = JSON.parse(cleanedContent);
      
      // Clean up the content
      if (parsed.content && typeof parsed.content === 'string') {
        parsed.content = parsed.content
          .replace(/\\n\\n/g, '</p><p class="text-justify">')
          .replace(/\\n/g, ' ')
          .replace(/\\/g, '');
        
        if (!parsed.content.startsWith('<')) {
          parsed.content = `<p class="text-justify">${parsed.content}</p>`;
        }
      }
    } catch (e) {
      console.log("Failed to parse as JSON, extracting content manually. Error:", e);
      
      // Try to extract just the HTML content if JSON parsing failed
      let extractedContent = rawContent;
      extractedContent = extractedContent.replace(/```(?:json|html)?\s*/g, '').replace(/```/g, '');
      
      const contentMatch = extractedContent.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"excerpt"|"\s*})/);
      if (contentMatch) {
        extractedContent = contentMatch[1]
          .replace(/\\n\\n/g, '</p><p class="text-justify">')
          .replace(/\\n/g, ' ')
          .replace(/\\"/g, '"')
          .replace(/\\/g, '');
      }
      
      const excerptMatch = rawContent.match(/"excerpt"\s*:\s*"([^"]+)"/);
      const categoryMatch = rawContent.match(/"category"\s*:\s*"([^"]+)"/);
      
      parsed = {
        content: extractedContent,
        excerpt: excerptMatch ? excerptMatch[1] : title.slice(0, 150) + "...",
        category: categoryMatch ? categoryMatch[1] : "Geral",
      };
    }

    const finalContent = parsed.content || rawContent;

    console.log("PDF article formatted successfully for admin:", userData.user.email);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          content: finalContent,
          excerpt: parsed.excerpt || title.slice(0, 150),
          category: parsed.category || "Geral",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error formatting PDF article:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
