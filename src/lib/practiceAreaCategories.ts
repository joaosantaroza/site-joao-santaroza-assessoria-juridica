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
  
  // Recuperação de Contas Digitais
  recovery_instagram: ['Direito Digital', 'Recuperação de Contas', 'Instagram', 'Hackeamento'],
  recovery_facebook: ['Direito Digital', 'Recuperação de Contas', 'Facebook', 'Hackeamento'],
  recovery_mercadolivre: ['Direito Digital', 'Recuperação de Contas', 'Mercado Livre', 'Direito do Consumidor'],
  
  // Auxílio-Acidente
  auxilio_acidente: ['Previdenciário', 'Auxílio-Acidente', 'INSS', 'Benefício', 'Incapacidade'],
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
  recovery_instagram: 'Artigos sobre Recuperação de Instagram',
  recovery_facebook: 'Artigos sobre Recuperação de Facebook',
  recovery_mercadolivre: 'Artigos sobre Recuperação de Mercado Livre',
};
