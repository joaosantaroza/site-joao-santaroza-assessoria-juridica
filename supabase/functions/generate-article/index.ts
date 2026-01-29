import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    console.log(`Generating article for title: ${title}`);

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
      
      // Handle nested JSON in markdown blocks
      const jsonMatch = cleanedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
      }
      
      parsed = JSON.parse(cleanedContent);
    } catch {
      console.log("Failed to parse as JSON, using raw content");
      // If not valid JSON, use the content as-is
      parsed = {
        content: rawContent,
        excerpt: title.slice(0, 150) + "...",
        category: "Geral",
        readTime: "5 min",
      };
    }

    console.log("Article generated successfully");

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
