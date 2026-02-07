/**
 * Maps practice area IDs to their related blog article categories.
 * Used to show relevant articles on each specialty page.
 */
export const PRACTICE_AREA_CATEGORIES: Record<string, string[]> = {
  // Isenção de IR
  hiv: ['Isenção', 'HIV', 'Tributário', 'Imposto de Renda', 'Isenção Fiscal'],
  general_tax: ['Isenção', 'Tributário', 'Moléstia', 'Imposto de Renda', 'Isenção Fiscal'],
  tax_hub: ['Isenção', 'Tributário', 'Imposto de Renda', 'Isenção Fiscal'],
  
  // Desbloqueio de Contas
  unlock: ['SISBAJUD', 'Desbloqueio', 'Penhora', 'Execução', 'Bloqueio'],
  
  // Direito do Trabalho
  labor: ['Trabalho', 'Trabalhista', 'CLT', 'Demissão', 'Rescisão', 'Gestante'],
  
  // Gestão de Passivos
  prescription: ['Prescrição', 'Dívida', 'Execução Fiscal', 'Passivo'],
  
  // Contratos e Societário
  contracts: ['Contrato', 'Societário', 'Holding', 'Empresarial', 'Tributário', 'Planejamento'],
};

/**
 * Gets article section title based on practice area.
 */
export const PRACTICE_AREA_ARTICLE_TITLES: Record<string, string> = {
  hiv: 'Artigos sobre Isenção de IR',
  general_tax: 'Artigos sobre Moléstias Graves',
  tax_hub: 'Artigos sobre Isenção Fiscal',
  unlock: 'Artigos sobre Desbloqueio Judicial',
  labor: 'Artigos sobre Direito do Trabalho',
  prescription: 'Artigos sobre Gestão de Passivos',
  contracts: 'Artigos sobre Contratos e Planejamento',
};
