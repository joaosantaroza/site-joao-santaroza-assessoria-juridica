import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://lovable.dev",
  "https://lovableproject.com",
  "https://joaosantarozaadvocacia.com.br",
  "https://www.joaosantarozaadvocacia.com.br",
];

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
  ) return true;
  if (o.startsWith("http://localhost:") || o.startsWith("http://127.0.0.1:")) return true;
  return ALLOWED_ORIGINS.includes(o);
};

const getCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin ?? "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    if (!isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: "Acesso não autorizado." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Auth check
    const authHeader = req.headers.get("Authorization");
    const apiKeyHeader = req.headers.get("apikey");
    if (!authHeader && !apiKeyHeader) {
      return new Response(JSON.stringify({ error: "Acesso não autorizado." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Configuração do servidor incompleta." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      global: { headers: { Authorization: authHeader || `Bearer ${apiKeyHeader}` } }
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasRole } = await supabaseAdmin.rpc("has_role", {
      _user_id: userData.user.id, _role: "admin"
    });

    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Permissão negada." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { title, excerpt, content, type = "caption" } = await req.json();

    if (!title || !content) {
      return new Response(JSON.stringify({ error: "Título e conteúdo são obrigatórios." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Strip HTML from content
    const plainContent = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const truncatedContent = plainContent.substring(0, 3000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Serviço de IA não configurado." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const isCarousel = type === "carousel";

    const systemPrompt = `Você é um especialista em marketing jurídico digital para Instagram, focado em conteúdo educativo e informativo para escritórios de advocacia no Brasil.

ÉTICA JURÍDICA — CONFORMIDADE COM PROVIMENTO 205/2021 OAB:
- Tom informativo e sóbrio, sem linguagem de vendas
- NUNCA use: "ligue agora", "contrate", "consulta grátis", "melhor advogado", "causa ganha"
- CTAs permitidos: "Salve este post", "Compartilhe com quem precisa", "Comente suas dúvidas", "Siga para mais conteúdo"
- NUNCA mencione o nome do escritório, advogados ou marcas

ESTILO:
- Linguagem simples e acessível (zero juridiquês)
- Use emojis estrategicamente (não exagere)
- Quebre o texto em linhas curtas para legibilidade no celular
- Inclua hashtags relevantes no final`;

    let userPrompt: string;

    if (isCarousel) {
      userPrompt = `Com base no artigo abaixo, crie um CARROSSEL para Instagram com 7-10 slides.

FORMATO OBRIGATÓRIO (responda EXATAMENTE neste formato JSON):
{
  "slides": [
    { "slide": 1, "type": "capa", "titulo": "Título chamativo do carrossel", "subtitulo": "Subtítulo curto" },
    { "slide": 2, "type": "conteudo", "titulo": "Título do slide", "texto": "Texto curto do slide (máx 3 linhas)" },
    ...
    { "slide": N, "type": "cta", "titulo": "CTA final", "texto": "Salve e compartilhe!" }
  ],
  "legenda": "Legenda para acompanhar o carrossel no feed (com hashtags)",
  "hashtags": ["#direito", "#advocacia", ...]
}

REGRAS:
- Slide 1: Capa com título impactante e pergunta ou gancho
- Slides 2-N: Conteúdo dividido em pontos claros e objetivos
- Último slide: CTA (salvar, compartilhar, seguir)
- Cada slide deve ter texto curto (máx 50 palavras)
- A legenda deve ter 150-300 palavras com hashtags

ARTIGO:
Título: ${title}
Resumo: ${excerpt || ''}
Conteúdo: ${truncatedContent}`;
    } else {
      userPrompt = `Com base no artigo abaixo, crie uma LEGENDA para post no Instagram.

FORMATO OBRIGATÓRIO (responda EXATAMENTE neste formato JSON):
{
  "legenda": "Texto completo da legenda formatado para Instagram",
  "hashtags": ["#direito", "#advocacia", ...],
  "gancho": "Primeira frase de gancho (hook) para prender atenção"
}

REGRAS:
- A legenda deve ter entre 200-400 palavras
- Comece com um gancho forte (pergunta, dado impactante ou frase curta)
- Use emojis estrategicamente (📌 ⚖️ ✅ 💡 👉 📲)
- Quebre em parágrafos curtos (2-3 linhas)
- Termine com CTA ("Salve este post!", "Compartilhe com quem precisa!")
- Inclua 15-20 hashtags relevantes
- Use linguagem simples e direta

ARTIGO:
Título: ${title}
Resumo: ${excerpt || ''}
Conteúdo: ${truncatedContent}`;
    }

    console.log(`Admin ${userData.user.email} generating ${type} for article: ${title}`);

    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
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

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", errText);
      return new Response(JSON.stringify({ error: "Erro ao gerar conteúdo com IA." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // Try to parse JSON from the response
    let parsedResult;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawContent];
      parsedResult = JSON.parse(jsonMatch[1].trim());
    } catch {
      // If parsing fails, return raw text
      parsedResult = isCarousel
        ? { slides: [], legenda: rawContent, hashtags: [] }
        : { legenda: rawContent, hashtags: [], gancho: "" };
    }

    return new Response(JSON.stringify({ result: parsedResult, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Erro interno." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
