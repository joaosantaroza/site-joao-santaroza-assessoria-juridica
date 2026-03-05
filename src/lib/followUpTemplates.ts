/**
 * Templates de mensagens WhatsApp para follow-up por área jurídica e step.
 * Step 1 = dia seguinte, Step 2 = 3 dias, Step 3 = 7 dias.
 */

interface FollowUpTemplate {
  step1: string;
  step2: string;
  step3: string;
}

const templates: Record<string, FollowUpTemplate> = {
  // Isenção de IR / HIV
  'Isenção de IR': {
    step1: 'Olá {nome}, tudo bem? Aqui é do escritório João Santaroza Advocacia. Vi que você demonstrou interesse em isenção de Imposto de Renda por doença grave. Gostaria de esclarecer alguma dúvida? Estamos à disposição para uma consulta inicial.',
    step2: 'Olá {nome}! Passando para lembrar que o direito à isenção de IR por moléstia grave pode representar uma economia significativa. Muitos clientes conseguem restituir valores pagos nos últimos 5 anos. Quer saber mais?',
    step3: 'Olá {nome}, tudo bem? Última mensagem sobre isenção de IR. Caso ainda tenha interesse, estamos disponíveis para analisar seu caso sem compromisso. É um direito que muitas pessoas desconhecem. Conte conosco!',
  },
  'HIV': {
    step1: 'Olá {nome}, tudo bem? Aqui é do escritório João Santaroza Advocacia. Vi que você demonstrou interesse em isenção de IR para portadores de HIV. Trabalhamos com total sigilo e discrição. Posso ajudar com alguma dúvida?',
    step2: 'Olá {nome}! Gostaria de reforçar que portadores de HIV têm direito à isenção de IR, independentemente de apresentar sintomas. Podemos analisar seu caso com total confidencialidade.',
    step3: 'Olá {nome}, passando uma última vez. A isenção de IR é um direito garantido por lei. Se precisar de orientação jurídica sigilosa, estamos à disposição. Basta responder esta mensagem.',
  },
  // Direito do Trabalho
  'Direito do Trabalho': {
    step1: 'Olá {nome}, tudo bem? Aqui é do escritório João Santaroza Advocacia. Vi que você demonstrou interesse em questões trabalhistas. Posso ajudar a esclarecer seus direitos? Estamos à disposição.',
    step2: 'Olá {nome}! Muitos direitos trabalhistas têm prazo para serem reivindicados. Se você tem dúvidas sobre rescisão, horas extras ou estabilidade, é importante agir rápido. Podemos conversar?',
    step3: 'Olá {nome}, última mensagem! Caso ainda tenha questões trabalhistas, lembre-se de que o prazo para reclamar na Justiça é de até 2 anos após a saída. Estamos prontos para ajudar.',
  },
  'Estabilidade Gestante': {
    step1: 'Olá {nome}, tudo bem? Aqui é do escritório João Santaroza Advocacia. Vi que você se interessou pelo tema da estabilidade gestante. Posso esclarecer alguma dúvida sobre seus direitos?',
    step2: 'Olá {nome}! A estabilidade da gestante é garantida desde a confirmação da gravidez até 5 meses após o parto. Se você está passando por alguma situação no trabalho, podemos orientar.',
    step3: 'Olá {nome}, passando uma última vez. A proteção à gestante no trabalho é um direito fundamental. Se precisar de orientação jurídica, estamos à disposição. Conte conosco!',
  },
  // Desbloqueio de Contas
  'Desbloqueio Judicial': {
    step1: 'Olá {nome}, tudo bem? Aqui é do escritório João Santaroza Advocacia. Vi que você demonstrou interesse em desbloqueio de contas bancárias. Está com alguma conta bloqueada? Posso ajudar.',
    step2: 'Olá {nome}! O bloqueio indevido de contas pode causar grandes transtornos. Trabalhamos com pedidos urgentes de desbloqueio judicial. Quer agendar uma análise do seu caso?',
    step3: 'Olá {nome}, última mensagem sobre desbloqueio judicial. Se a situação persiste, existem medidas judiciais urgentes que podem ser tomadas. Estamos prontos para ajudar.',
  },
  // Contratos e Planejamento
  'Contratos': {
    step1: 'Olá {nome}, tudo bem? Aqui é do escritório João Santaroza Advocacia. Vi que você demonstrou interesse em consultoria contratual. Posso ajudar com alguma demanda específica?',
    step2: 'Olá {nome}! Um contrato bem elaborado evita problemas futuros. Se você precisa revisar ou elaborar contratos, oferecemos consultoria especializada. Vamos conversar?',
    step3: 'Olá {nome}, passando uma última vez. Se ainda precisa de orientação em contratos ou planejamento societário, estamos à disposição para uma análise sem compromisso.',
  },
  // Recuperação de Contas Digitais
  'Recuperação de Contas': {
    step1: 'Olá {nome}, tudo bem? Aqui é do escritório João Santaroza Advocacia. Vi que você se interessou pela recuperação de contas digitais. Teve alguma conta hackeada ou bloqueada? Posso ajudar.',
    step2: 'Olá {nome}! A recuperação judicial de contas digitais tem tido bons resultados. Se sua conta foi hackeada ou indevidamente bloqueada, podemos agir rapidamente.',
    step3: 'Olá {nome}, última mensagem! Se ainda não conseguiu recuperar sua conta, existem medidas judiciais eficazes. Estamos prontos para ajudar.',
  },
};

// Default template for areas not specifically mapped
const defaultTemplate: FollowUpTemplate = {
  step1: 'Olá {nome}, tudo bem? Aqui é do escritório João Santaroza Advocacia. Vi que você demonstrou interesse em nossos serviços jurídicos. Posso ajudar com alguma dúvida? Estamos à disposição.',
  step2: 'Olá {nome}! Passando para saber se podemos ajudar com alguma questão jurídica. Oferecemos uma análise inicial sem compromisso. Vamos conversar?',
  step3: 'Olá {nome}, última mensagem! Se ainda precisar de orientação jurídica, estamos à disposição. Basta responder esta mensagem. Conte conosco!',
};

/**
 * Finds the best matching template for a given practice area.
 */
function findTemplate(practiceArea: string): FollowUpTemplate {
  // Direct match
  if (templates[practiceArea]) return templates[practiceArea];

  // Partial match
  const lowerArea = practiceArea.toLowerCase();
  for (const [key, tmpl] of Object.entries(templates)) {
    if (lowerArea.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerArea)) {
      return tmpl;
    }
  }

  // Keyword-based matching
  if (lowerArea.includes('isenc') || lowerArea.includes('imposto') || lowerArea.includes('tributar')) {
    return templates['Isenção de IR'];
  }
  if (lowerArea.includes('hiv')) return templates['HIV'];
  if (lowerArea.includes('trabalh') || lowerArea.includes('clt') || lowerArea.includes('demiss')) {
    return templates['Direito do Trabalho'];
  }
  if (lowerArea.includes('gestante') || lowerArea.includes('gravid')) {
    return templates['Estabilidade Gestante'];
  }
  if (lowerArea.includes('bloqueio') || lowerArea.includes('desbloqueio') || lowerArea.includes('sisbajud') || lowerArea.includes('penhora')) {
    return templates['Desbloqueio Judicial'];
  }
  if (lowerArea.includes('contrato') || lowerArea.includes('societar') || lowerArea.includes('holding')) {
    return templates['Contratos'];
  }
  if (lowerArea.includes('instagram') || lowerArea.includes('facebook') || lowerArea.includes('hack') || lowerArea.includes('mercado livre') || lowerArea.includes('conta digital')) {
    return templates['Recuperação de Contas'];
  }

  return defaultTemplate;
}

/**
 * Get follow-up message for a given area, step, and name.
 */
export function getFollowUpMessage(practiceArea: string, step: number, name: string): string {
  const tmpl = findTemplate(practiceArea);
  const key = step === 1 ? 'step1' : step === 2 ? 'step2' : 'step3';
  return tmpl[key].replace(/{nome}/g, name.split(' ')[0]);
}

/**
 * Build a WhatsApp link with pre-filled message.
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Get step label for display.
 */
export function getStepLabel(step: number): string {
  switch (step) {
    case 1: return '1º contato (dia seguinte)';
    case 2: return '2º contato (3 dias)';
    case 3: return '3º contato (7 dias)';
    default: return `${step}º contato`;
  }
}
