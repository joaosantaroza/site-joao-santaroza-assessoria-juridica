import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CATEGORIES = ['geral', 'previdenciario', 'trabalhista', 'tributario', 'consumidor'];

interface TrendingTopic {
  title: string;
  description: string;
  keywords: string[];
  interest_level: string;
  category: string;
  seo_potential: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Scheduled Research] Starting weekly trending topics research...');

    // Select a random category to research each week (or cycle through them)
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const categoryIndex = weekNumber % CATEGORIES.length;
    const category = CATEGORIES[categoryIndex];

    console.log(`[Scheduled Research] Researching category: ${category}`);

    const categoryLabels: Record<string, string> = {
      'geral': 'Direito em geral',
      'previdenciario': 'Direito Previdenciário',
      'trabalhista': 'Direito Trabalhista',
      'tributario': 'Direito Tributário',
      'consumidor': 'Direito do Consumidor',
    };

    const categoryLabel = categoryLabels[category] || 'Direito';

    const systemPrompt = `Você é um especialista em marketing jurídico e SEO para escritórios de advocacia no Brasil.
Sua tarefa é identificar os temas jurídicos mais relevantes e em alta nos últimos 7 dias que podem gerar tráfego orgânico para um blog jurídico.

FOCO: ${categoryLabel}

Analise notícias, decisões judiciais, mudanças legislativas e tendências de busca para identificar oportunidades de conteúdo.`;

    const userPrompt = `Pesquise e identifique os 5 temas jurídicos mais relevantes e em alta nos últimos 7 dias na área de ${categoryLabel}.

Para cada tema, forneça:
1. Um título otimizado para SEO (60-70 caracteres)
2. Uma descrição breve do tema (máx 150 caracteres)
3. 4-5 palavras-chave relacionadas
4. Nível de interesse: "Alto", "Médio-Alto" ou "Médio"
5. Categoria específica
6. Potencial de SEO explicando por que esse tema pode ranquear bem

Retorne APENAS um JSON válido no seguinte formato:
{
  "trending_topics": [
    {
      "title": "Título otimizado para SEO",
      "description": "Descrição breve do tema",
      "keywords": ["palavra1", "palavra2", "palavra3", "palavra4"],
      "interest_level": "Alto",
      "category": "${categoryLabel}",
      "seo_potential": "Explicação do potencial de SEO"
    }
  ],
  "research_summary": "Resumo geral das tendências identificadas"
}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        search_domain_filter: [
          'conjur.com.br',
          'migalhas.com.br', 
          'stf.jus.br',
          'stj.jus.br',
          'tst.jus.br',
          'jusbrasil.com.br'
        ],
        search_recency_filter: 'week',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Perplexity response');
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    const topics: TrendingTopic[] = parsedData.trending_topics || [];

    console.log(`[Scheduled Research] Found ${topics.length} trending topics`);

    // Create notification for admins
    const topicsList = topics.slice(0, 3).map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    
    const { error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'trending_research',
        title: `🔥 ${topics.length} Trending Topics Identificados`,
        message: `Pesquisa semanal de ${categoryLabel} concluída.\n\nDestaques:\n${topicsList}`,
        data: {
          category,
          topics_count: topics.length,
          topics: topics.slice(0, 5),
          research_summary: parsedData.research_summary,
          researched_at: new Date().toISOString(),
        },
      });

    if (notificationError) {
      console.error('[Scheduled Research] Error creating notification:', notificationError);
    } else {
      console.log('[Scheduled Research] Admin notification created successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        category,
        topics_count: topics.length,
        message: 'Pesquisa semanal concluída e notificação enviada.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Scheduled Research] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
