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
        JSON.stringify({ error: "Permissão negada. Apenas administradores podem gerar artigos." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title } = await req.json();
    
    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: "Título inválido. Mínimo de 5 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${userData.user.email} generating article for title: ${title}`);

    const systemPrompt = `Você é um redator jurídico especializado em Direito Tributário, Trabalhista e Previdenciário brasileiro. 
Seu estilo é profissional, acessível e educativo. Você escreve para um público leigo que busca entender seus direitos.

REGRAS DE FORMATAÇÃO:
- Use HTML semântico para estruturar o conteúdo
- Use <h2> para títulos de seção (nunca <h1>)
- Use <h3> para subtítulos
- Use <p> para parágrafos com class="text-justify"
- Use <ul> e <li> para listas
- Use <blockquote> para citações ou destaques importantes
- Use <strong> para termos importantes
- Inclua referências a leis, súmulas e jurisprudência quando relevante
- O texto deve ter entre 800 e 1500 palavras
- Termine com um parágrafo de chamada para ação profissional

CONTEXTO DO ESCRITÓRIO:
- O escritório é do Dr. João Victor Santaroza, OAB/PR 81.381
- Atua principalmente com isenção de IR por moléstia grave, direitos trabalhistas e previdenciários
- Localizado no Paraná, com atuação digital em todo Brasil`;

    const userPrompt = `Escreva um artigo jurídico completo e bem fundamentado sobre o seguinte tema:

"${title}"

O artigo deve:
1. Começar com uma introdução impactante que contextualize o problema
2. Apresentar a fundamentação legal detalhada
3. Incluir jurisprudência relevante quando aplicável
4. Fornecer orientações práticas ao leitor
5. Concluir com uma chamada para buscar orientação profissional

Retorne também um resumo (excerpt) de no máximo 200 caracteres.

Formato de resposta JSON:
{
  "content": "<HTML do artigo>",
  "excerpt": "Resumo curto do artigo",
  "category": "Categoria sugerida (Isenção Fiscal, Trabalho, Previdenciário, etc.)",
  "readTime": "X min"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar conteúdo" }),
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

    console.log("AI response received, parsing...");

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
      
      // Clean up the content: convert literal \n to actual line breaks and remove escaped sequences
      if (parsed.content && typeof parsed.content === 'string') {
        parsed.content = parsed.content
          .replace(/\\n\\n/g, '</p><p class="text-justify">')  // Double newlines become paragraph breaks
          .replace(/\\n/g, ' ')  // Single newlines become spaces
          .replace(/\\/g, '');   // Remove remaining backslashes
        
        // Ensure content is wrapped in paragraphs if it starts with text
        if (!parsed.content.startsWith('<')) {
          parsed.content = `<p class="text-justify">${parsed.content}</p>`;
        }
      }
    } catch (e) {
      console.log("Failed to parse as JSON, extracting content manually. Error:", e);
      
      // Try to extract just the HTML content if JSON parsing failed
      let extractedContent = rawContent;
      
      // Remove any markdown code block wrappers
      extractedContent = extractedContent.replace(/```(?:json|html)?\s*/g, '').replace(/```/g, '');
      
      // Try to extract content from partial JSON
      const contentMatch = extractedContent.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"excerpt"|"\s*})/);
      if (contentMatch) {
        extractedContent = contentMatch[1]
          .replace(/\\n\\n/g, '</p><p class="text-justify">')
          .replace(/\\n/g, ' ')
          .replace(/\\"/g, '"')
          .replace(/\\/g, '');
      }
      
      // Extract excerpt if present
      const excerptMatch = rawContent.match(/"excerpt"\s*:\s*"([^"]+)"/);
      const categoryMatch = rawContent.match(/"category"\s*:\s*"([^"]+)"/);
      
      parsed = {
        content: extractedContent,
        excerpt: excerptMatch ? excerptMatch[1] : title.slice(0, 150) + "...",
        category: categoryMatch ? categoryMatch[1] : "Geral",
        readTime: "5 min",
      };
    }

    console.log("Article generated successfully for admin:", userData.user.email);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          content: parsed.content || rawContent,
          excerpt: parsed.excerpt || title.slice(0, 150),
          category: parsed.category || "Geral",
          readTime: parsed.readTime || "5 min",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating article:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
