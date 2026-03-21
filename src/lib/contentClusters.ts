/**
 * Content Clusters Configuration
 * 
 * Defines thematic clusters for SEO optimization.
 * Articles within the same cluster are linked together for better internal linking
 * and topical authority.
 */

export interface ContentCluster {
  id: string;
  name: string;
  description: string;
  pillarSlug: string;
  pillarTitle: string;
  pillarDescription: string;
  pillarIntro: string;
  keywords: string[];
  categories: string[];
  icon: string; // lucide icon name
}

export const CONTENT_CLUSTERS: ContentCluster[] = [
  {
    id: 'isencao-ir',
    name: 'Isenção de Imposto de Renda',
    description: 'Conteúdo sobre isenção de IR para portadores de doenças graves',
    pillarSlug: '/temas/isencao-ir',
    pillarTitle: 'Tudo sobre Isenção de Imposto de Renda por Doença Grave',
    pillarDescription: 'Guia completo sobre isenção de IR para aposentados e pensionistas com doenças graves. Lei 7.713/88, doenças que garantem isenção, restituição retroativa e como solicitar.',
    pillarIntro: 'A legislação brasileira prevê a **isenção do Imposto de Renda** sobre proventos de aposentadoria, pensão e reforma para portadores de doenças graves, conforme a Lei 7.713/88. Esse benefício visa garantir que os recursos financeiros sejam direcionados ao tratamento e bem-estar do contribuinte.\n\nNesta página, reunimos todos os nossos artigos sobre o tema para que você compreenda seus direitos em profundidade — desde a lista de doenças que garantem a isenção até o passo a passo para recuperar valores pagos indevidamente nos últimos 5 anos.\n\nO entendimento do STJ (Súmula 627) é claro: **não é necessário demonstrar sintomas ativos** para ter direito ao benefício. Basta o diagnóstico da doença prevista em lei.',
    keywords: [
      'isenção imposto de renda',
      'isenção IR doença grave',
      'restituição imposto de renda',
      'aposentado doença grave',
      'isenção IR HIV',
      'isenção IR câncer',
      'moléstia grave IR',
      'Lei 7.713/88',
    ],
    categories: ['Isenção Fiscal', 'Direito Tributário'],
    icon: 'BookOpen',
  },
  {
    id: 'direito-trabalhista',
    name: 'Direito do Trabalho',
    description: 'Conteúdo sobre direitos trabalhistas, rescisões e CLT',
    pillarSlug: '/temas/direito-trabalhista',
    pillarTitle: 'Tudo sobre Direitos Trabalhistas e CLT',
    pillarDescription: 'Guia completo sobre direitos trabalhistas: demissão, verbas rescisórias, FGTS, estabilidade gestante, horas extras e muito mais. Entenda seus direitos.',
    pillarIntro: 'O **Direito do Trabalho** regula as relações entre empregadores e empregados, garantindo proteções fundamentais previstas na CLT e na Constituição Federal.\n\nReunimos aqui todos os nossos artigos sobre direitos trabalhistas, desde verbas rescisórias e modalidades de demissão até estabilidades provisórias e direitos específicos como os da gestante.\n\nSeja você um trabalhador buscando entender seus direitos ou uma empresa querendo se adequar à legislação, este é o seu guia completo.',
    keywords: [
      'direito trabalhista',
      'verbas rescisórias',
      'demissão sem justa causa',
      'FGTS multa',
      'advogado trabalhista',
      'CLT direitos',
      'reclamação trabalhista',
    ],
    categories: ['Trabalho', 'Direito Trabalhista'],
    icon: 'Users',
  },
  {
    id: 'desbloqueio-contas',
    name: 'Desbloqueio de Contas e Execução',
    description: 'Conteúdo sobre bloqueios judiciais e liberação de valores',
    pillarSlug: '/temas/desbloqueio-contas',
    pillarTitle: 'Tudo sobre Execução Fiscal e Desbloqueio de Contas',
    pillarDescription: 'Guia completo sobre bloqueios judiciais, SISBAJUD, penhora de bens, impenhorabilidade, defesa do executado e como desbloquear contas bancárias.',
    pillarIntro: 'O **bloqueio judicial de contas bancárias** é uma das medidas mais impactantes para empresas e pessoas físicas. Através do sistema SISBAJUD, a Justiça pode determinar a penhora de valores em questão de segundos.\n\nNo entanto, existem diversas hipóteses de **impenhorabilidade** previstas em lei que protegem salários, aposentadorias e valores essenciais à subsistência. Além disso, é possível impugnar penhoras excessivas e requerer a substituição de garantia.\n\nReunimos aqui nossos artigos sobre prescrição em execuções fiscais, defesa do avalista, meios de impugnação e estratégias para liberação de valores bloqueados.',
    keywords: [
      'desbloqueio conta',
      'penhora judicial',
      'SISBAJUD',
      'conta bloqueada',
      'impenhorabilidade',
      'execução fiscal',
      'prescrição execução fiscal',
    ],
    categories: ['Execução', 'Direito Empresarial', 'SISBAJUD', 'Desbloqueio', 'Penhora', 'Prescrição', 'Execução Fiscal'],
    icon: 'Shield',
  },
  {
    id: 'direito-previdenciario',
    name: 'Direito Previdenciário',
    description: 'Conteúdo sobre INSS, aposentadorias e benefícios',
    pillarSlug: '/temas/direito-previdenciario',
    pillarTitle: 'Tudo sobre Direito Previdenciário e INSS',
    pillarDescription: 'Guia completo sobre aposentadoria, benefícios do INSS, revisão de aposentadoria, auxílio-doença, BPC/LOAS e direitos previdenciários.',
    pillarIntro: 'O **Direito Previdenciário** garante proteção social aos trabalhadores em situações de doença, invalidez, idade avançada e outros eventos que impeçam o exercício da atividade laboral.\n\nNossos artigos abordam temas como aposentadoria especial, revisão de benefícios, auxílio-doença, BPC/LOAS e estratégias para garantir o melhor benefício possível junto ao INSS.\n\nEntenda seus direitos e saiba como buscar a correção de benefícios pagos a menor.',
    keywords: [
      'aposentadoria especial',
      'INSS benefício',
      'revisão aposentadoria',
      'auxílio doença',
      'BPC LOAS',
    ],
    categories: ['Previdenciário', 'INSS'],
    icon: 'Clock',
  },
  {
    id: 'auxilio-acidente',
    name: 'Auxílio-Acidente',
    description: 'Conteúdo sobre auxílio-acidente do INSS, conversão B31/B94 e retroativos',
    pillarSlug: '/temas/auxilio-acidente',
    pillarTitle: 'Tudo sobre Auxílio-Acidente do INSS',
    pillarDescription: 'Guia completo sobre auxílio-acidente: requisitos, conversão de auxílio-doença (B31 para B94), acumulação com salário, retroativos pelo Tema 862 do STJ e doenças ocupacionais como LER/DORT.',
    pillarIntro: 'O **Auxílio-Acidente** (benefício B94) é uma indenização paga pelo INSS ao segurado que sofre um acidente ou desenvolve doença ocupacional e fica com sequelas permanentes que reduzem sua capacidade de trabalho. Diferente do auxílio-doença, ele pode ser **acumulado com o salário**, pois tem natureza indenizatória.\n\nNesta página, reunimos todos os nossos artigos sobre o tema — desde os requisitos para concessão até estratégias para recuperar valores retroativos dos últimos 5 anos com base no **Tema 862 do STJ**.\n\nSe você sofreu um acidente de trabalho, desenvolveu LER/DORT, perda auditiva ou qualquer condição que deixou sequelas permanentes, entenda seus direitos e saiba como garantir o benefício mesmo após o retorno ao trabalho.',
    keywords: [
      'auxílio-acidente INSS',
      'benefício B94',
      'conversão B31 para B94',
      'auxílio-acidente acumula com salário',
      'retroativo auxílio-acidente',
      'Tema 862 STJ',
      'sequela permanente INSS',
      'LER DORT auxílio-acidente',
      'doença ocupacional INSS',
      'perda auditiva INSS',
    ],
    categories: ['Auxílio-Acidente', 'Previdenciário', 'INSS'],
    icon: 'HeartPulse',
  },
  {
    id: 'direito-digital',
    name: 'Direito Digital e Recuperação de Contas',
    description: 'Conteúdo sobre recuperação de contas hackeadas e direitos digitais',
    pillarSlug: '/temas/direito-digital',
    pillarTitle: 'Tudo sobre Direito Digital e Recuperação de Contas',
    pillarDescription: 'Guia completo sobre recuperação de contas hackeadas no Instagram, Facebook e Mercado Livre. Medidas judiciais contra plataformas digitais.',
    pillarIntro: 'A **vida digital** se tornou uma extensão da vida real, e a perda de acesso a contas em redes sociais ou plataformas de e-commerce pode causar prejuízos financeiros e emocionais significativos.\n\nReunimos aqui nossos artigos sobre como agir judicialmente para recuperar contas hackeadas ou bloqueadas indevidamente em plataformas como Instagram, Facebook e Mercado Livre.\n\nA jurisprudência brasileira tem sido cada vez mais favorável ao consumidor nessas situações, reconhecendo o dever das plataformas de garantir a segurança das contas.',
    keywords: [
      'conta hackeada',
      'recuperar instagram',
      'recuperar facebook',
      'conta bloqueada mercado livre',
      'direito digital',
    ],
    categories: ['Direito Digital', 'Recuperação de Contas', 'Instagram', 'Facebook', 'Mercado Livre'],
    icon: 'Laptop',
  },
  {
    id: 'desbloqueio-mercado-livre',
    name: 'Desbloqueio de Contas no Mercado Livre',
    description: 'Conteúdo especializado sobre suspensão algorítmica, retenção de saldo e defesa jurídica contra o Mercado Livre',
    pillarSlug: '/temas/desbloqueio-mercado-livre',
    pillarTitle: 'Tudo sobre Desbloqueio de Contas no Mercado Livre',
    pillarDescription: 'Guia completo sobre desbloqueio de contas suspensas no Mercado Livre em 2025-2026: moderação algorítmica, retenção de saldo no Mercado Pago, fundamentação jurídica, lucros cessantes e tutela de urgência.',
    pillarIntro: 'O cenário do e-commerce em **2025-2026** é marcado por uma crise sem precedentes: a moderação algorítmica agressiva do Mercado Livre está suspendendo contas de lojistas legítimos em escala industrial, sem análise humana e sem o devido processo legal.\n\nO bloqueio não é apenas um contratempo — ele congela saldos no Mercado Pago por até 180 dias, interrompe operações e pode levar empresas à insolvência em questão de dias. A plataforma frequentemente invoca violações genéricas dos Termos de Uso, sem detalhar a infração ou oferecer oportunidade real de defesa.\n\nNesta página, reunimos nossos artigos sobre como enfrentar juridicamente essas suspensões injustas, desde a **fundamentação constitucional** (eficácia horizontal dos direitos fundamentais) até a **tutela de urgência** para liberação imediata de valores retidos, passando pela **perícia contábil de lucros cessantes** e o passo a passo do esgotamento extrajudicial.',
    keywords: [
      'desbloqueio mercado livre',
      'conta suspensa mercado livre',
      'saldo retido mercado pago',
      'liberação de saldo mercado pago',
      'liminar mercado livre',
      'tutela urgência marketplace',
      'lucros cessantes e-commerce',
      'moderação algorítmica',
      'Marco Civil da Internet',
      'CDC marketplace',
      'advogado mercado livre',
      'conta bloqueada mercado livre 2026',
    ],
    categories: ['Mercado Livre', 'Desbloqueio Mercado Livre', 'E-commerce', 'Marketplace', 'Direito do Consumidor'],
    icon: 'ShoppingBag',
  },
  {
    id: 'reajuste-plano-saude',
    name: 'Reajuste Abusivo em Planos de Saúde',
    description: 'Conteúdo especializado sobre reajustes abusivos em planos de saúde individuais e coletivos',
    pillarSlug: '/temas/reajuste-plano-saude',
    pillarTitle: 'Tudo sobre Reajuste Abusivo em Planos de Saúde',
    pillarDescription: 'Guia completo sobre reajustes abusivos em planos de saúde: falso coletivo, teto ANS, sinistralidade, faixa etária, cancelamento unilateral e como reverter aumentos ilegais.',
    pillarIntro: 'O mercado de **saúde suplementar** no Brasil atravessa uma crise de transparência. Enquanto a ANS limita o reajuste de planos individuais a 6,06% (2025), operadoras aplicam aumentos de 15% a 45% em planos coletivos — muitas vezes sem apresentar a composição atuarial que justifique a majoração.\n\nA **Tese do Falso Coletivo** tem ganhado força nos tribunais: planos vendidos via MEI ou PME com menos de 30 vidas, sem negociação real entre as partes, devem ser equiparados a planos individuais e submetidos ao teto da ANS. O **Tema 1082 do STJ** consolida a proteção contra cancelamentos unilaterais durante tratamentos.\n\nNesta página, reunimos nossos artigos sobre como identificar reajustes ilegais, contestá-los judicialmente e recuperar valores pagos a mais nos últimos 3 anos.',
    keywords: [
      'reajuste abusivo plano de saúde',
      'falso coletivo plano de saúde',
      'teto ANS reajuste',
      'plano de saúde MEI reajuste',
      'sinistralidade plano coletivo',
      'reajuste faixa etária idoso',
      'cancelamento plano de saúde',
      'Tema 1082 STJ',
      'advogado plano de saúde',
      'reajuste plano coletivo ilegal',
    ],
    categories: ['Plano de Saúde', 'Direito do Consumidor', 'Reajuste Abusivo', 'Saúde Suplementar'],
    icon: 'Stethoscope',
  },
  {
    id: 'elaboracao-contratos',
    name: 'Elaboração de Contratos',
    description: 'Conteúdo especializado sobre elaboração, revisão e blindagem de contratos empresariais e societários',
    pillarSlug: '/temas/elaboracao-contratos',
    pillarTitle: 'Tudo sobre Elaboração de Contratos Empresariais',
    pillarDescription: 'Guia completo sobre elaboração de contratos: cláusulas essenciais, blindagem contratual, acordos societários, LGPD, prestação de serviços, franquias e resolução de disputas.',
    pillarIntro: 'A **elaboração de contratos** é o alicerce da segurança jurídica nas relações comerciais. Em 2025-2026, a complexidade regulatória crescente — especialmente com a LGPD e as novas normas de compliance — torna indispensável que empresas e profissionais invistam em instrumentos contratuais bem estruturados.\n\nContratos mal redigidos são a principal causa de litígios empresariais no Brasil. Cláusulas ambíguas, omissões sobre responsabilidades e ausência de mecanismos de resolução de disputas geram insegurança e exposição desnecessária a riscos.\n\nNesta página, reunimos nossos artigos sobre as melhores práticas na elaboração contratual — desde contratos de prestação de serviços até acordos societários complexos, passando por adequação à LGPD e estratégias de blindagem patrimonial.',
    keywords: [
      'elaboração de contratos',
      'revisão contratual',
      'contrato de prestação de serviços',
      'acordo de sócios',
      'blindagem contratual',
      'contrato empresarial',
      'LGPD contratos',
      'cláusula de não-concorrência',
      'distrato contratual',
      'contrato de franquia',
      'advogado contratual',
      'direito empresarial contratos',
    ],
    categories: ['Elaboração de Contratos', 'Direito Empresarial', 'Contrato', 'Societário', 'LGPD'],
    icon: 'FileText',
  },
];

/**
 * Get cluster by category
 */
export const getClusterByCategory = (category: string): ContentCluster | undefined => {
  return CONTENT_CLUSTERS.find(cluster => 
    cluster.categories.some(cat => 
      cat.toLowerCase() === category.toLowerCase()
    )
  );
};

/**
 * Get cluster by ID
 */
export const getClusterById = (clusterId: string): ContentCluster | undefined => {
  return CONTENT_CLUSTERS.find(cluster => cluster.id === clusterId);
};

/**
 * Get all clusters that match any of the given categories
 */
export const getClustersByCategories = (categories: string[]): ContentCluster[] => {
  return CONTENT_CLUSTERS.filter(cluster =>
    cluster.categories.some(clusterCat =>
      categories.some(cat => cat.toLowerCase() === clusterCat.toLowerCase())
    )
  );
};

/**
 * Check if two articles are in the same cluster
 */
export const areInSameCluster = (categories1: string[], categories2: string[]): boolean => {
  const clusters1 = getClustersByCategories(categories1);
  const clusters2 = getClustersByCategories(categories2);
  
  return clusters1.some(c1 => clusters2.some(c2 => c1.id === c2.id));
};
