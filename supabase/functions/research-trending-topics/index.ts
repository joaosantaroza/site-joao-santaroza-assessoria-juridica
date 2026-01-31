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

  if (o === "null") return true;

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

// Legal news sources for trending research
const LEGAL_NEWS_DOMAINS = [
  "conjur.com.br",
  "migalhas.com.br",
  "stf.jus.br",
  "stj.jus.br",
  "gov.br",
  "jusbrasil.com.br",
  "jota.info",
  "folha.uol.com.br",
  "g1.globo.com",
];

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    if (!isAllowedOrigin(origin)) {
      console.error("Blocked request from unauthorized origin:", origin);
      return new Response(
        JSON.stringify({ error: "Acesso não autorizado." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const apiKeyHeader = req.headers.get("apikey");

    if (!authHeader && !apiKeyHeader) {
      return new Response(
        JSON.stringify({ error: "Acesso não autorizado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      global: { headers: { Authorization: authHeader || `Bearer ${apiKeyHeader}` } }
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasRole, error: roleError } = await supabaseAdmin.rpc(
      "has_role",
      { _user_id: userData.user.id, _role: "admin" }
    );

    if (roleError || !hasRole) {
      return new Response(
        JSON.stringify({ error: "Permissão negada. Apenas administradores podem pesquisar tópicos." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { category = 'geral' } = await req.json();

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${userData.user.email} researching trending legal topics (category: ${category})`);

    // Category-specific prompts for better research
    const categoryPrompts: Record<string, string> = {
      'geral': 'direito brasileiro em geral, incluindo todas as áreas jurídicas',
      'previdenciario': 'direito previdenciário, INSS, aposentadoria, benefícios, pensões e auxílios',
      'trabalhista': 'direito trabalhista, CLT, demissões, direitos do trabalhador, rescisão e assédio',
      'tributario': 'direito tributário, impostos, isenções fiscais, imposto de renda e restituição',
      'consumidor': 'direito do consumidor, compras online, garantias, trocas e reclamações',
      'familia': 'direito de família, divórcio, pensão alimentícia, guarda e inventário',
      'saude': 'direito à saúde, planos de saúde, erro médico, medicamentos e SUS',
    };

    const categoryContext = categoryPrompts[category] || categoryPrompts['geral'];

    const systemPrompt = `Você é um especialista em análise de tendências jurídicas no Brasil. Sua tarefa é identificar os temas jurídicos mais relevantes e em alta na última semana.

FOCO DA PESQUISA:
- Área: ${categoryContext}
- Busque notícias e discussões dos últimos 7 dias
- Priorize temas com alto interesse público e potencial de engajamento
- Considere mudanças legislativas, decisões judiciais importantes e casos de grande repercussão

CRITÉRIOS DE SELEÇÃO:
1. Relevância atual (está sendo discutido agora)
2. Interesse público (afeta muitas pessoas)
3. Potencial educativo (pode ajudar o leitor a entender seus direitos)
4. Viabilidade para artigo de blog (tema claro e objetivo)

IMPORTANTE:
- Foque em temas práticos que interessam ao cidadão comum
- Evite temas excessivamente técnicos ou de nicho
- Prefira assuntos com aplicação prática no dia a dia`;

    const userPrompt = `Pesquise e identifique os 5 temas jurídicos mais relevantes e em alta na última semana no Brasil, na área de ${categoryContext}.

Para cada tema, forneça:
1. Um título atrativo para artigo de blog (máximo 70 caracteres)
2. Uma breve descrição do por quê o tema está em alta (2-3 frases)
3. Palavras-chave SEO relevantes (3-5 palavras)
4. Nível de interesse estimado (alto, médio-alto, médio)
5. Categoria sugerida

Retorne a resposta em formato JSON válido:
{
  "trending_topics": [
    {
      "title": "Título atrativo para o artigo",
      "description": "Por que este tema está em alta e por que é importante",
      "keywords": ["palavra1", "palavra2", "palavra3"],
      "interest_level": "alto",
      "category": "Categoria sugerida",
      "seo_potential": "Explicação breve do potencial SEO"
    }
  ],
  "research_summary": "Resumo geral das tendências identificadas",
  "data_sources": ["Fontes consultadas"]
}`;

    // Use sonar-deep-research for comprehensive trending analysis
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-deep-research",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 4000,
        search_domain_filter: LEGAL_NEWS_DOMAINS,
        search_recency_filter: "week",
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
      
      return new Response(
        JSON.stringify({ error: "Erro ao pesquisar tópicos" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const rawContent = aiResponse.choices?.[0]?.message?.content;
    const citations = aiResponse.citations || [];

    if (!rawContent) {
      return new Response(
        JSON.stringify({ error: "Resposta vazia da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Deep research response received with", citations.length, "citations");

    // Parse the response
    let parsed;
    try {
      let cleanedContent = rawContent.trim();
      const jsonMatch = cleanedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }
      parsed = JSON.parse(cleanedContent);
    } catch (e) {
      console.log("Failed to parse JSON, extracting manually:", e);
      
      // Try to extract topics array
      const topicsMatch = rawContent.match(/"trending_topics"\s*:\s*\[([\s\S]*?)\]/);
      if (topicsMatch) {
        try {
          parsed = {
            trending_topics: JSON.parse(`[${topicsMatch[1]}]`),
            research_summary: "Pesquisa realizada com sucesso",
            data_sources: citations,
          };
        } catch {
          parsed = {
            trending_topics: [],
            research_summary: rawContent,
            data_sources: citations,
          };
        }
      } else {
        parsed = {
          trending_topics: [],
          research_summary: rawContent,
          data_sources: citations,
        };
      }
    }

    console.log("Trending topics research completed for admin:", userData.user.email);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          trending_topics: parsed.trending_topics || [],
          research_summary: parsed.research_summary || "",
          data_sources: parsed.data_sources || citations,
          researched_at: new Date().toISOString(),
          category: category,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error researching trending topics:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
