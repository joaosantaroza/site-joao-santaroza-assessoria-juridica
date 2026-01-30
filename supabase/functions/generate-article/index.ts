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

// Domain filter for legal sources in Brazil
const LEGAL_DOMAINS = [
  "planalto.gov.br",
  "stf.jus.br",
  "stj.jus.br",
  "tst.jus.br",
  "gov.br",
  "conjur.com.br",
  "migalhas.com.br",
  "jusbrasil.com.br",
];

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

    const { title, tone = 'acessivel', includeLegalBasis = true, customInstructions } = await req.json();
    
    // If using custom instructions, we need those instead of title
    const isCustomMode = !!customInstructions && customInstructions.trim().length >= 10;
    
    if (!isCustomMode && (!title || typeof title !== "string" || title.trim().length < 5)) {
      return new Response(
        JSON.stringify({ error: "Título inválido. Mínimo de 5 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (isCustomMode && customInstructions.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Instruções muito curtas. Mínimo de 10 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate tone
    const validTones = ['formal', 'acessivel', 'tecnico'];
    const selectedTone = validTones.includes(tone) ? tone : 'acessivel';

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      console.error("PERPLEXITY_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${userData.user.email} generating article with Perplexity (tone: ${selectedTone}, legalBasis: ${includeLegalBasis}, customMode: ${isCustomMode}) for ${isCustomMode ? 'custom instructions' : 'title: ' + title}`);

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

    // Legal basis instructions based on toggle
    const legalBasisInstructions = includeLegalBasis
      ? `BASES LEGAIS:
- Pode mencionar leis, artigos e normas quando relevante
- Integre as referências legais de forma NATURAL e FLUIDA ao texto
- Exemplos: "De acordo com a Lei X...", "A legislação prevê que...", "O artigo Y determina..."
- NÃO cite jurisprudência, número de processos ou decisões de tribunais`
      : `BASES LEGAIS:
- NÃO mencione leis, artigos, números de legislação ou qualquer referência legal específica
- NÃO cite jurisprudência, tribunais ou processos
- Foque APENAS em explicar o tema de forma prática e acessível
- Use expressões genéricas como "a lei permite", "você tem direito a", "é garantido que"`;

    const systemPrompt = `Você é um redator de conteúdo especializado em criar artigos de BLOG informativos sobre temas jurídicos no Brasil.

IMPORTANTE - ESTILO BLOG INFORMATIVO:
- Escreva como um artigo de blog para INFORMAR e EDUCAR o leitor
- NÃO use linguagem rebuscada ou excessivamente jurídica
- O foco é o leitor entender o assunto, não impressionar com termos técnicos
- Use uma linguagem que qualquer pessoa consiga entender facilmente

${legalBasisInstructions}

${toneInstructions[selectedTone as keyof typeof toneInstructions]}

REGRAS DE FORMATAÇÃO:
- Use HTML semântico para estruturar o conteúdo
- Use <h2> para títulos de seção (nunca <h1>)
- Use <h3> para subtítulos quando necessário
- Use <p> para parágrafos com class="text-justify"
- Use <ul> e <li> para listas quando apropriado
- Use <blockquote> para destaques importantes ou dicas
- Use <strong> para termos importantes
- O texto deve ter entre 800 e 1500 palavras
- Termine com um parágrafo convidando o leitor a buscar orientação profissional

CONTEXTO DO ESCRITÓRIO:
- O escritório é do Dr. João Victor Santaroza, OAB/PR 81.381
- Atua principalmente com isenção de IR por moléstia grave, direitos trabalhistas e previdenciários
- Localizado no Paraná, com atuação digital em todo Brasil`;

    const legalBasisUserInstruction = includeLegalBasis
      ? `3. Pode citar leis e artigos quando necessário, mas integre naturalmente ao texto (ex: "De acordo com a Lei X..." ou "A legislação prevê que...")`
      : `3. NÃO mencione leis, artigos ou números de legislação - explique tudo de forma prática sem referências legais específicas`;

    // Different prompts for custom mode vs title mode
    const userPrompt = isCustomMode
      ? `Baseado nas seguintes instruções do usuário, crie um artigo de BLOG informativo completo:

INSTRUÇÕES DO USUÁRIO:
"${customInstructions}"

SUAS TAREFAS:
1. Crie um TÍTULO atrativo e otimizado para SEO (máximo 70 caracteres)
2. Escreva uma introdução que conecte com o leitor e apresente o tema de forma envolvente
3. Desenvolva o conteúdo de forma clara, explicando o tema como se conversasse com o leitor
${legalBasisUserInstruction}
4. NÃO inclua citações de jurisprudência, decisões de tribunais ou número de processos
5. Foque em orientações práticas e informações úteis
6. Conclua incentivando o leitor a buscar ajuda profissional se precisar

Retorne a resposta em formato JSON válido:
{
  "title": "Título atrativo para o artigo",
  "content": "<HTML do artigo completo>",
  "excerpt": "Resumo curto do artigo (máximo 200 caracteres)",
  "category": "Categoria sugerida (Isenção Fiscal, Trabalho, Previdenciário, etc.)",
  "readTime": "X min"
}`
      : `Escreva um artigo de BLOG informativo sobre o seguinte tema:

"${title}"

INSTRUÇÕES:
1. Comece com uma introdução que conecte com o leitor e apresente o tema de forma envolvente
2. Desenvolva o conteúdo de forma clara, explicando o tema como se conversasse com o leitor
${legalBasisUserInstruction}
4. NÃO inclua citações de jurisprudência, decisões de tribunais ou número de processos
5. Foque em orientações práticas e informações úteis
6. Conclua incentivando o leitor a buscar ajuda profissional se precisar

Retorne a resposta em formato JSON válido:
{
  "content": "<HTML do artigo completo>",
  "excerpt": "Resumo curto do artigo (máximo 200 caracteres)",
  "category": "Categoria sugerida (Isenção Fiscal, Trabalho, Previdenciário, etc.)",
  "readTime": "X min"
}`;

    // Call Perplexity API with sonar-pro model for grounded search
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
        search_domain_filter: LEGAL_DOMAINS,
        return_related_questions: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      
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
        JSON.stringify({ error: "Erro ao gerar conteúdo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const rawContent = aiResponse.choices?.[0]?.message?.content;
    const citations = aiResponse.citations || [];

    if (!rawContent) {
      console.error("No content in Perplexity response");
      return new Response(
        JSON.stringify({ error: "Resposta vazia da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Perplexity response received with", citations.length, "citations");

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
      
      // Extract fields if present
      const titleMatch = rawContent.match(/"title"\s*:\s*"([^"]+)"/);
      const excerptMatch = rawContent.match(/"excerpt"\s*:\s*"([^"]+)"/);
      const categoryMatch = rawContent.match(/"category"\s*:\s*"([^"]+)"/);
      
      parsed = {
        title: titleMatch ? titleMatch[1] : null,
        content: extractedContent,
        excerpt: excerptMatch ? excerptMatch[1] : (isCustomMode ? "" : title.slice(0, 150) + "..."),
        category: categoryMatch ? categoryMatch[1] : "Geral",
        readTime: "5 min",
      };
    }

    // Content without sources section - sources are still returned in the response for reference
    const finalContent = parsed.content || rawContent;
    
    // Extract generated title for custom mode
    const generatedTitle = isCustomMode ? (parsed.title || null) : null;

    console.log("Article generated successfully for admin:", userData.user.email);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title: generatedTitle,
          content: finalContent,
          excerpt: parsed.excerpt || (isCustomMode ? "" : title.slice(0, 150)),
          category: parsed.category || "Geral",
          readTime: parsed.readTime || "5 min",
          sources: citations,
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
