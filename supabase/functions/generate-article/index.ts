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

// Domain filter for legal sources in Brazil - Prioritizing regional and authoritative sources
const LEGAL_DOMAINS = [
  "planalto.gov.br",
  "stf.jus.br",
  "stj.jus.br",
  "tst.jus.br",
  "gov.br",
  "conjur.com.br",
  "migalhas.com.br",
  "jusbrasil.com.br",
  "tjpr.jus.br",
  "oabpr.org.br",
  "alep.pr.gov.br",
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

    const { 
      title, 
      tone = 'acessivel', 
      includeLegalBasis = true,
      includeFaq = true,
      customInstructions,
      seoMode = false,
      seoKeywords = [],
      maringaMode = false,
      imageStyle = 'photographic',
      articleLength = 'medium'
    } = await req.json();
    
    // Article length configurations
    const lengthConfigs: Record<string, { min: number; max: number; label: string }> = {
      short: { min: 400, max: 600, label: 'curto' },
      medium: { min: 800, max: 1200, label: 'médio' },
      long: { min: 1500, max: 2000, label: 'longo' }
    };
    const selectedLength = lengthConfigs[articleLength] || lengthConfigs.medium;
    
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

    console.log(`Admin ${userData.user.email} generating article with Perplexity (tone: ${selectedTone}, legalBasis: ${includeLegalBasis}, faq: ${includeFaq}, customMode: ${isCustomMode}, seoMode: ${seoMode}, maringaMode: ${maringaMode}, imageStyle: ${imageStyle}, length: ${articleLength}) for ${isCustomMode ? 'custom instructions' : 'title: ' + title}`);

    // Modo Maringá - Geolocalização Máxima
    const maringaModeInstructions = maringaMode
      ? `
MODO MARINGÁ - GEOLOCALIZAÇÃO MÁXIMA (OBRIGATÓRIO):
Este artigo DEVE ser fortemente geolocalizado para Maringá e Norte do Paraná.

MENÇÕES GEOGRÁFICAS OBRIGATÓRIAS (distribuir ao longo do texto):
- "Maringá" (pelo menos 3-5 vezes)
- "Norte do Paraná" ou "região Norte do Paraná"
- Cidades vizinhas: Sarandi, Paiçandu, Marialva, Mandaguari, Astorga, Apucarana
- Zonas específicas: Zona 3, Zona 7, Novo Centro, Zona Industrial

CONEXÕES REGIONAIS OBRIGATÓRIAS:
- Cite o Fórum de Maringá quando mencionar processos judiciais
- Cite o TJ-PR (Tribunal de Justiça do Paraná) para decisões estaduais
- Cite a OAB Maringá ou OAB Paraná para referências institucionais
- Relacione com a economia local (agronegócio, agroindústria, cooperativas)
- Use exemplos práticos de trabalhadores e empresários da região

TÍTULO E INTRODUÇÃO:
- O título DEVE conter "Maringá" ou "Paraná" ou "Norte do Paraná"
- A primeira frase DEVE mencionar Maringá ou região
- Exemplo de título: "Direitos do Trabalhador Rural em Maringá: Guia Completo 2025"

EXEMPLOS CONTEXTUAIS REGIONAIS:
- "Para trabalhadores das cooperativas agrícolas de Maringá..."
- "Se você mora em Maringá, Sarandi ou região..."
- "Conforme entendimento do Fórum de Maringá..."
- "Os trabalhadores da Zona Industrial de Maringá têm direito a..."
`
      : '';

    // SEO-specific instructions when in SEO mode - Local SEO only when Maringá Mode is also active
    const seoInstructions = seoMode && seoKeywords.length > 0
      ? `
OTIMIZAÇÃO SEO (PRIORIDADE MÁXIMA):
Este artigo deve ser 100% otimizado para SEO e ranqueamento orgânico no Google.

PALAVRAS-CHAVE ALVO: ${seoKeywords.join(', ')}

ESTRATÉGIAS SEO OBRIGATÓRIAS:
1. Primeira frase deve conter a palavra-chave principal de forma natural
2. Use as palavras-chave nos primeiros 100 caracteres do texto
3. Distribua as palavras-chave naturalmente ao longo do texto (densidade 1-2%)
4. Use sinônimos e variações das palavras-chave (LSI keywords)
5. Estruture com H2 e H3 contendo palavras-chave secundárias
6. Escreva parágrafos curtos (máximo 3-4 linhas para facilitar leitura no celular)
7. Inclua listas com bullets para facilitar a leitura
8. Use perguntas como subtítulos (formato FAQ implícito)
9. Mencione "2025" ou "atualizado" para relevância temporal
10. O texto deve ter entre 1200 e 2000 palavras para ranquear bem
11. Inclua uma seção de "Perguntas Frequentes" no final (3-5 perguntas)
12. Termine com CTA suave convidando para esclarecimento de dúvidas
${maringaMode ? `
CONEXÃO REGIONAL (MODO MARINGÁ ATIVO):
- Cite órgãos locais quando relevante (ex: "Fórum de Maringá", "TJ-PR", "OAB Maringá")
- Relacione o tema com a realidade da região (agronegócio, trabalhadores da Zona Industrial, etc.)
- Use exemplos práticos do cotidiano de Maringá e região

ESTRUTURA SEO LOCAL IDEAL:
- Título H1 com palavra-chave + modificador geográfico (ex: "em Maringá", "no Paraná")
- Introdução com gancho local e palavra-chave (100-150 palavras)
- Seção "O que é [tema]" ou "Como funciona [tema] em Maringá"
- Seção com requisitos/documentos/passo a passo
- Seção de benefícios ou vantagens para o cidadão da região
- Seção de perguntas frequentes (3-5 perguntas)
- Conclusão com CTA suave (convite para dúvidas ou materiais educativos)` : `
ESTRUTURA SEO IDEAL:
- Título H1 atrativo com palavra-chave principal
- Introdução envolvente com palavra-chave (100-150 palavras)
- Seção explicativa "O que é [tema]" ou "Como funciona [tema]"
- Seção com requisitos/documentos/passo a passo
- Seção de benefícios ou vantagens
- Seção de perguntas frequentes (3-5 perguntas)
- Conclusão com CTA suave (convite para dúvidas ou materiais educativos)`}`
      : '';

    // Tone-specific instructions for blog-style articles - Enhanced with Linguagem Simples
    // Contexto regional só aparece quando Modo Maringá está ativo
    const regionalExamples = maringaMode 
      ? '- Use exemplos práticos do cotidiano de Maringá e região'
      : '- Use exemplos práticos do cotidiano brasileiro';
    
    const toneInstructions = {
      formal: `ESTILO DE ESCRITA:
- Use linguagem clara mas com tom profissional
- Mantenha formalidade sem ser rebuscado
- Evite jargões excessivos, prefira explicar conceitos
- Estruture de forma organizada e elegante`,
      acessivel: `ESTILO DE ESCRITA (LINGUAGEM SIMPLES - OBRIGATÓRIO):
- ZERO JURIDIQUÊS: Traduza termos complexos para linguagem acessível
  - Exemplos: "litispendência" → "o processo está em andamento"
  - "exequibilidade" → "se pode ser cobrado na justiça"
- Use linguagem simples e direta, como uma conversa
- Explique tudo como se falasse com um amigo leigo
${regionalExamples}
- Parágrafos curtos (máximo 3-4 linhas) para leitura no celular
- Priorize clareza acima de tudo
- Ilustre como decisões jurídicas impactam a vida cotidiana`,
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

    // System prompt base - contexto regional apenas quando Modo Maringá está ativo
    const expertiseContext = maringaMode
      ? 'Você é um especialista em Marketing Jurídico e SEO Local focado na região de Maringá e Norte do Paraná.'
      : 'Você é um especialista em Marketing Jurídico e redação de conteúdo jurídico para o Brasil.';
    
    const officeContext = maringaMode
      ? `CONTEXTO DO ESCRITÓRIO:
- O escritório é do Dr. João Victor Santaroza, OAB/PR 81.381
- Atua principalmente com isenção de IR por moléstia grave, direitos trabalhistas e previdenciários
- Localizado em Maringá, Paraná, com atuação digital em todo Brasil
- Foco regional: Maringá, Sarandi, Paiçandu, Marialva, Mandaguari, Norte do Paraná`
      : `CONTEXTO DO ESCRITÓRIO:
- O escritório é do Dr. João Victor Santaroza, OAB/PR 81.381
- Atua principalmente com isenção de IR por moléstia grave, direitos trabalhistas e previdenciários
- Atuação digital em todo Brasil`;
    
    const systemPrompt = `${expertiseContext}
Você atua como redator sênior para o escritório "João Santaroza Assessoria Jurídica".

${maringaModeInstructions}

${seoInstructions}

ÉTICA JURÍDICA — CONFORMIDADE TOTAL COM PROVIMENTO 205/2021 OAB (OBRIGATÓRIO):

PRINCÍPIOS FUNDAMENTAIS:
- SOBRIEDADE: A publicidade não pode ter estética de varejo. Nada de apelos emocionais exagerados ou linguagem de vendas.
- INFORMATIVIDADE: Todo conteúdo deve ter viés educativo. O advogado demonstra autoridade intelectual, não faz oferta comercial.
- NÃO-MERCANTILIZAÇÃO: A advocacia é múnus público. Termos como "desconto", "promoção", "grátis", "ligue já", "contrate", "melhor advogado", "preço popular" são ESTRITAMENTE PROIBIDOS.
- VERACIDADE: É proibido criar falsas expectativas. NUNCA prometa "causa ganha", "sucesso garantido", "indenização certa" ou use gatilhos de escassez ("vagas limitadas", "só até hoje").

TERMOS E EXPRESSÕES PROIBIDOS:
- Mercantis: "Ligue agora", "Contrate", "Consulta grátis", "Preço popular", "Promoção", "Desconto", "Garanta já"
- Promessa de resultado: "Causa ganha", "Sucesso garantido", "Indenização certa", "Limpe seu nome agora"
- Superlativos: "O melhor advogado", "O mais especializado", "Líder em", "Número 1"
- Imperativos comerciais: "Contrate", "Ligue", "Compre" (substituir por "Entenda", "Saiba mais", "Conheça seus direitos")

CASOS CONCRETOS E PROVA SOCIAL — PROIBIDO:
- NUNCA divulgue casos concretos, mesmo anonimizados (ex: "Alvará expedido!", "Absolvição conseguida!")
- NUNCA inclua depoimentos de clientes reais ou fictícios
- A exposição de resultados serve como promessa implícita de resultado, o que é vedado pela OAB-SP (2025)

CTAs PERMITIDOS (usar exclusivamente):
- "Esclareça suas dúvidas com um especialista"
- "Saiba mais sobre seus direitos"
- "Consulte um profissional qualificado"
- "Conheça seus direitos"
- "Tire suas dúvidas"
- "Agende uma orientação"

IA E RESPONSABILIDADE EDITORIAL:
- O advogado mantém responsabilidade integral pelo conteúdo gerado por IA
- NUNCA invente leis, jurisprudências ou decisões judiciais — cite apenas o que é verificável
- O conteúdo deve ter originalidade e pessoalidade, evitando textos genéricos e padronizados
- A supervisão humana é obrigatória antes da publicação

IMPORTANTE - ESTILO BLOG INFORMATIVO:
- Escreva como um artigo de blog para INFORMAR e EDUCAR o leitor
- NÃO use linguagem rebuscada ou excessivamente jurídica (zero juridiquês)
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
- O texto deve ter entre ${seoMode ? '1200 e 2000' : `${selectedLength.min} e ${selectedLength.max}`} palavras (tamanho ${selectedLength.label})
${includeFaq ? `- OBRIGATÓRIO: Inclua uma seção "Perguntas Frequentes" no final do artigo com 3-5 perguntas e respostas relevantes sobre o tema. Use <h2>Perguntas Frequentes</h2> seguido de <h3> para cada pergunta e <p> para as respostas.` : '- NÃO inclua seção de perguntas frequentes'}
- Termine com um parágrafo convidando o leitor a esclarecer dúvidas ou acessar materiais educativos

PROIBIÇÃO DE NÚMEROS DE CITAÇÃO (OBRIGATÓRIO):
- NUNCA inclua números entre colchetes como [1], [2], [3] ou similares
- NUNCA use notação de referência numérica de nenhum tipo
- NÃO adicione notas de rodapé ou indicadores de fonte numerados
- O texto deve ser puramente narrativo e fluido, sem marcadores de citação
- Se precisar indicar uma fonte, mencione-a naturalmente no texto (ex: "segundo a CLT", "conforme o STF")

${officeContext}`;

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

GERAÇÃO DE TAGS SEO (OBRIGATÓRIO):
Gere 3-5 tags otimizadas para SEO que:
- Sejam palavras-chave relevantes para busca orgânica
- Incluam termos que as pessoas realmente pesquisam no Google
- Combinem termos gerais (ex: "direito trabalhista") com específicos (ex: "rescisão contratual")
- Priorizem termos com volume de busca (ex: "aposentadoria", "INSS", "demissão")
- Incluam variações geográficas se relevante (ex: "Maringá", "Paraná")

Retorne a resposta em formato JSON válido:
{
  "title": "Título atrativo para o artigo",
  "content": "<HTML do artigo completo>",
  "excerpt": "Resumo curto do artigo (máximo 200 caracteres)",
  "category": "Categoria principal (Isenção Fiscal, Trabalho, Previdenciário, etc.)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readTime": "X min",
  "metaDescription": "Meta description otimizada para SEO com 150-160 caracteres"
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

GERAÇÃO DE TAGS SEO (OBRIGATÓRIO):
Gere 3-5 tags otimizadas para SEO que:
- Sejam palavras-chave relevantes para busca orgânica
- Incluam termos que as pessoas realmente pesquisam no Google
- Combinem termos gerais (ex: "direito trabalhista") com específicos (ex: "rescisão contratual")
- Priorizem termos com volume de busca (ex: "aposentadoria", "INSS", "demissão")
- Incluam variações geográficas se relevante (ex: "Maringá", "Paraná")

Retorne a resposta em formato JSON válido:
{
  "content": "<HTML do artigo completo>",
  "excerpt": "Resumo curto do artigo (máximo 200 caracteres)",
  "category": "Categoria principal (Isenção Fiscal, Trabalho, Previdenciário, etc.)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readTime": "X min",
  "metaDescription": "Meta description otimizada para SEO com 150-160 caracteres"
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
      
      // Try to extract tags array
      const tagsMatch = rawContent.match(/"tags"\s*:\s*\[(.*?)\]/s);
      let extractedTags: string[] = [];
      if (tagsMatch) {
        try {
          extractedTags = JSON.parse(`[${tagsMatch[1]}]`);
        } catch {
          extractedTags = tagsMatch[1].split(',').map((t: string) => t.replace(/"/g, '').trim()).filter(Boolean);
        }
      }
      
      const metaDescMatch = rawContent.match(/"metaDescription"\s*:\s*"([^"]+)"/);
      
      parsed = {
        title: titleMatch ? titleMatch[1] : null,
        content: extractedContent,
        excerpt: excerptMatch ? excerptMatch[1] : (isCustomMode ? "" : title.slice(0, 150) + "..."),
        category: categoryMatch ? categoryMatch[1] : "Geral",
        tags: extractedTags,
        metaDescription: metaDescMatch ? metaDescMatch[1] : null,
        readTime: "5 min",
      };
    }

    // Content without sources section - sources are still returned in the response for reference
    const finalContent = parsed.content || rawContent;
    
    // Extract generated title for custom mode
    const generatedTitle = isCustomMode ? (parsed.title || null) : null;
    const articleTitle = generatedTitle || title;
    
    // Generate SEO tags array - combine category with generated tags
    const seoTags: string[] = [];
    if (parsed.category && parsed.category !== "Geral") {
      seoTags.push(parsed.category);
    }
    if (Array.isArray(parsed.tags)) {
      parsed.tags.forEach((tag: string) => {
        if (tag && !seoTags.includes(tag)) {
          seoTags.push(tag);
        }
      });
    }
    // Limit to 5 unique tags
    const finalTags = [...new Set(seoTags)].slice(0, 5);

    console.log("Article generated successfully for admin:", userData.user.email, "with", finalTags.length, "SEO tags");

    // Generate cover image using Lovable AI
    let coverImageUrl: string | null = null;
    try {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      
      if (LOVABLE_API_KEY) {
        console.log("Generating cover image with Lovable AI for article:", articleTitle);
        
        // Create a prompt for the cover image based on article theme
        const categoryKeywords: Record<string, string> = {
          "Isenção Fiscal": "tax documents, money, medical reports, health justice",
          "Trabalho": "workplace, workers, labor rights, employment",
          "Previdenciário": "retirement, pension, elderly care, INSS",
          "Civil": "contracts, family, property, legal documents",
          "Tributário": "taxes, finances, calculator, money",
          "Geral": "law, justice, legal documents, professional office"
        };
        
        const categoryHint = categoryKeywords[parsed.category] || categoryKeywords["Geral"];
        
        // Style-specific instructions
        const styleInstructions: Record<string, string> = {
          'abstract': 'Abstract art style with geometric shapes, flowing gradients, and symbolic representations. Modern minimalist design with bold colors and clean lines. No realistic elements, purely conceptual and artistic.',
          'photographic': 'Photorealistic professional stock photo style. Ultra high resolution, crisp details, natural lighting. Real-world objects and scenes that look like professional photography.',
          'illustration': 'Digital illustration style with artistic rendering. Vector-like clean lines, stylized elements, flat design with subtle shadows. Modern corporate illustration aesthetic.',
        };
        
        const selectedStyle = styleInstructions[imageStyle] || styleInstructions['photographic'];
        
        // Image prompt optimized for blog cover
        const imagePrompt = `Professional, modern blog header image for a Brazilian law firm article about: "${articleTitle}". 
Art Style: ${selectedStyle}
Design: Clean, professional, corporate design with subtle blue and gold accents. 
Elements: ${categoryHint}. 
Mood: Trustworthy, professional, accessible. 
Format: Wide 16:9 aspect ratio blog cover image. 
NO text, NO logos, NO people faces. ${imageStyle === 'abstract' ? 'Abstract or symbolic representation.' : 'Professional visual representation.'}
Ultra high resolution.`;

        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: imagePrompt
              }
            ],
            modalities: ["image", "text"]
          })
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const generatedImageBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (generatedImageBase64) {
            console.log("Image generated successfully, uploading to storage...");
            
            // Extract base64 data (remove data:image/png;base64, prefix)
            const base64Data = generatedImageBase64.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            // Generate unique filename
            const timestamp = Date.now();
            const randomId = crypto.randomUUID().split('-')[0];
            const imagePath = `covers/${timestamp}-${randomId}.png`;
            
            // Upload to blog-images bucket
            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
              .from('blog-images')
              .upload(imagePath, imageBuffer, {
                contentType: 'image/png',
                upsert: false
              });
            
            if (uploadError) {
              console.error("Failed to upload cover image:", uploadError.message);
            } else {
              // Get public URL
              const { data: publicUrlData } = supabaseAdmin.storage
                .from('blog-images')
                .getPublicUrl(imagePath);
              
              coverImageUrl = publicUrlData?.publicUrl || null;
              console.log("Cover image uploaded successfully:", coverImageUrl);
            }
          }
        } else {
          const errorText = await imageResponse.text();
          console.error("Image generation failed:", imageResponse.status, errorText);
        }
      } else {
        console.log("LOVABLE_API_KEY not configured, skipping cover image generation");
      }
    } catch (imageError) {
      console.error("Error generating cover image:", imageError);
      // Don't fail the whole request if image generation fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title: generatedTitle,
          content: finalContent,
          excerpt: parsed.excerpt || (isCustomMode ? "" : title.slice(0, 150)),
          category: parsed.category || "Geral",
          tags: finalTags,
          metaDescription: parsed.metaDescription || parsed.excerpt || null,
          readTime: parsed.readTime || "5 min",
          sources: citations,
          coverImageUrl: coverImageUrl,
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
