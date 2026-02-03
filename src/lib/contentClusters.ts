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
  pillarSlug: string; // Main hub/landing page for this cluster
  keywords: string[];
  categories: string[]; // Blog categories that belong to this cluster
}

export const CONTENT_CLUSTERS: ContentCluster[] = [
  {
    id: 'isencao-ir',
    name: 'Isenção de Imposto de Renda',
    description: 'Conteúdo sobre isenção de IR para portadores de doenças graves',
    pillarSlug: '/lp/isencao-imposto-renda',
    keywords: [
      'isenção imposto de renda',
      'isenção IR doença grave',
      'restituição imposto de renda',
      'aposentado doença grave',
      'isenção IR HIV',
      'isenção IR câncer',
      'moléstia grave IR',
    ],
    categories: ['Isenção Fiscal', 'Direito Tributário'],
  },
  {
    id: 'direito-trabalhista',
    name: 'Direito do Trabalho',
    description: 'Conteúdo sobre direitos trabalhistas, rescisões e CLT',
    pillarSlug: '/lp/advogado-trabalhista',
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
  },
  {
    id: 'desbloqueio-contas',
    name: 'Desbloqueio de Contas',
    description: 'Conteúdo sobre bloqueios judiciais e liberação de valores',
    pillarSlug: '/lp/desbloqueio-contas',
    keywords: [
      'desbloqueio conta',
      'penhora judicial',
      'SISBAJUD',
      'conta bloqueada',
      'impenhorabilidade',
      'execução fiscal',
    ],
    categories: ['Execução', 'Direito Empresarial'],
  },
  {
    id: 'direito-previdenciario',
    name: 'Direito Previdenciário',
    description: 'Conteúdo sobre INSS, aposentadorias e benefícios',
    pillarSlug: '/',
    keywords: [
      'aposentadoria especial',
      'INSS benefício',
      'revisão aposentadoria',
      'auxílio doença',
      'BPC LOAS',
    ],
    categories: ['Previdenciário', 'INSS'],
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
