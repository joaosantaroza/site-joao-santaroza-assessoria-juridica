/**
 * Client testimonials organized by practice area.
 * Names are anonymized for privacy (initials + city).
 */

export interface Testimonial {
  id: string;
  name: string; // Format: "M.S. - Maringá/PR"
  text: string;
  rating: number; // 1-5
  date: string;
  practiceAreas: string[]; // Which service pages to show this on
  areaLabel: string; // Friendly name of the practice area
}

export const TESTIMONIALS: Testimonial[] = [
  // Isenção de IR
  {
    id: 'test-1',
    name: 'M.S. - Maringá/PR',
    text: 'Após anos pagando imposto indevidamente, consegui a isenção e a restituição de mais de R$ 40 mil. O Dr. João explicou todo o processo com clareza e paciência.',
    rating: 5,
    date: 'Janeiro 2026',
    practiceAreas: ['hiv', 'general_tax', 'tax_hub'],
    areaLabel: 'Isenção de Imposto de Renda',
  },
  {
    id: 'test-2',
    name: 'R.A. - Londrina/PR',
    text: 'Achava que não tinha direito por estar bem de saúde. Descobri que a lei não exige sintomas. Processo rápido e 100% sigiloso.',
    rating: 5,
    date: 'Dezembro 2025',
    practiceAreas: ['hiv', 'tax_hub'],
    areaLabel: 'Isenção de Imposto de Renda',
  },
  {
    id: 'test-3',
    name: 'C.F. - Curitiba/PR',
    text: 'Minha mãe é aposentada e tem cardiopatia grave. Conseguimos a isenção e a restituição dos últimos 5 anos. Recomendo demais!',
    rating: 5,
    date: 'Novembro 2025',
    practiceAreas: ['general_tax', 'tax_hub'],
    areaLabel: 'Isenção de Imposto de Renda',
  },
  
  // Desbloqueio de Contas
  {
    id: 'test-4',
    name: 'Empresa do ramo alimentício - Maringá/PR',
    text: 'Tivemos as contas bloqueadas pelo SISBAJUD e a empresa quase parou. Em 48h o Dr. João conseguiu a liberação emergencial. Salvou nosso negócio.',
    rating: 5,
    date: 'Janeiro 2026',
    practiceAreas: ['unlock'],
    areaLabel: 'Desbloqueio de Contas',
  },
  {
    id: 'test-5',
    name: 'J.P. - Sarandi/PR',
    text: 'Meu salário foi penhorado indevidamente. Conseguiram provar a impenhorabilidade e liberaram o valor em poucos dias.',
    rating: 5,
    date: 'Outubro 2025',
    practiceAreas: ['unlock'],
    areaLabel: 'Desbloqueio de Contas',
  },
  
  // Direito do Trabalho
  {
    id: 'test-6',
    name: 'L.M. - Maringá/PR',
    text: 'Fui demitida grávida e a empresa se recusou a me reintegrar. O escritório entrou com ação e garantiu minha estabilidade. Profissionais excelentes.',
    rating: 5,
    date: 'Dezembro 2025',
    practiceAreas: ['labor'],
    areaLabel: 'Direito do Trabalho',
  },
  {
    id: 'test-7',
    name: 'Indústria têxtil - Cianorte/PR',
    text: 'Assessoria trabalhista preventiva que evitou vários processos. Revisaram todos os contratos e adequaram nossa empresa à legislação.',
    rating: 5,
    date: 'Setembro 2025',
    practiceAreas: ['labor', 'contracts'],
    areaLabel: 'Direito do Trabalho',
  },
  
  // Gestão de Passivos
  {
    id: 'test-8',
    name: 'A.B. - Paranavaí/PR',
    text: 'Tinha dívidas de mais de 10 anos me perseguindo. Provaram que estavam prescritas e consegui limpar meu nome finalmente.',
    rating: 5,
    date: 'Novembro 2025',
    practiceAreas: ['prescription'],
    areaLabel: 'Gestão de Passivos',
  },
  
  // Contratos e Societário
  {
    id: 'test-9',
    name: 'Clínica médica - Maringá/PR',
    text: 'Estruturaram nossa sociedade com holding e conseguimos uma economia tributária significativa. Trabalho técnico impecável.',
    rating: 5,
    date: 'Janeiro 2026',
    practiceAreas: ['contracts'],
    areaLabel: 'Contratos Empresariais',
  },
  {
    id: 'test-10',
    name: 'E.S. - Umuarama/PR',
    text: 'Revisaram o contrato de compra do meu imóvel e identificaram cláusulas abusivas que eu não tinha percebido. Evitaram um grande problema.',
    rating: 5,
    date: 'Agosto 2025',
    practiceAreas: ['contracts'],
    areaLabel: 'Contratos Empresariais',
  },
];

/**
 * Get testimonials for a specific practice area
 */
export const getTestimonialsByArea = (areaId: string): Testimonial[] => {
  return TESTIMONIALS.filter(t => t.practiceAreas.includes(areaId));
};

/**
 * Get featured testimonials (for general pages)
 */
export const getFeaturedTestimonials = (count: number = 3): Testimonial[] => {
  return TESTIMONIALS.slice(0, count);
};