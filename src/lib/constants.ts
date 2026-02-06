import { 
  Lock, 
  Activity, 
  Shield, 
  Users, 
  Clock, 
  FileText,
  LucideIcon 
} from 'lucide-react';

import gestanteProfissional from '@/assets/gestante-profissional.jpg';

export const CONTACT_INFO = {
  firmName: "JOÃO SANTAROZA",
  firmSub: "Assessoria Jurídica",
  lawyerName: "Dr. João Victor Mendes Brant Santaroza",
  oab: "OAB/PR 81.381",
  whatsapp: "(44) 99996-9598",
  phone: "(44) 99996-9598",
  email: "joaosantarozassessoriajuridica@gmail.com",
  instagram: "@joaovictorsantaroza.adv",
  address: "Atuação Digital em todo o Brasil (Sede no Paraná)",
  heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  lawyerPhoto: "/assets/lawyer-photo.jpg",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3659.604724773822!2d-51.92528!3d-23.42099!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ecd702812a8745%3A0x6e92c2195b0586e9!2sMaring%C3%A1%20-%20PR!5e0!3m2!1sen!2sbr!4v1620000000000" 
};

export interface Service {
  id: string;
  title: string;
  shortDesc: string;
  icon: LucideIcon;
  heroTitle: string;
  heroSubtitle: string;
  features: string[];
}

export const SERVICES: Record<string, Service> = {
  hiv: {
    id: 'hiv',
    title: 'Isenção de IR (HIV)',
    shortDesc: 'Direito previsto na legislação para portadores do vírus. Processo sigiloso.',
    icon: Lock, 
    heroTitle: 'Isenção de IR: Conheça seus Direitos',
    heroSubtitle: 'Se você é portador do HIV (mesmo assintomático), a lei prevê a isenção do imposto de renda sobre aposentadoria ou pensão. Saiba como requerer a restituição dos valores dos últimos 5 anos.',
    features: [
      'Isenção para Assintomáticos (Súmula 627 STJ)',
      'Sigilo Processual (Lei 14.289)',
      'Restituição Retroativa (5 anos)',
      'Aplicação à Previdência Privada'
    ]
  },
  general_tax: {
    id: 'general_tax',
    title: 'Isenção por Moléstia Grave',
    shortDesc: 'Câncer, Cardiopatia e outras condições da Lei 7.713/88.',
    icon: Activity,
    heroTitle: 'Isenção de IR por Moléstia Grave',
    heroSubtitle: 'Aposentados e reformados com doenças graves podem ter direito à isenção do imposto de renda, conforme previsto na Lei 7.713/88.',
    features: ['Análise de Laudos', 'Rol da Lei 7.713/88', 'Restituição de Valores', 'Orientação Técnica']
  },
  unlock: {
    id: 'unlock',
    title: 'Desbloqueio de Contas',
    shortDesc: 'Assessoria jurídica para liberação de contas bloqueadas.',
    icon: Shield,
    heroTitle: 'Assessoria em Desbloqueio de Contas',
    heroSubtitle: 'Bloqueios judiciais (SISBAJUD) podem comprometer o fluxo de caixa. Atuamos na análise técnica e defesa para buscar a liberação de valores.',
    features: ['Defesa em Bloqueios', 'Impugnação de Penhora', 'Tutela de Urgência', 'Análise de Impenhorabilidade']
  },
  labor: {
    id: 'labor',
    title: 'Direito do Trabalho',
    shortDesc: 'Orientação jurídica para Empresas e Empregados.',
    icon: Users,
    heroTitle: 'Direito do Trabalho',
    heroSubtitle: 'Atuação técnica na orientação de empresas e na defesa de direitos de trabalhadores, com foco em soluções negociadas.',
    features: [
      'Defesa Patronal', 
      'Cálculos Rescisórios', 
      'Reconhecimento de Vínculo',
      'Acordos Extrajudiciais'
    ]
  },
  prescription: {
    id: 'prescription',
    title: 'Gestão de Passivos',
    shortDesc: 'Análise de prescrição de dívidas antigas.',
    icon: Clock,
    heroTitle: 'Análise de Passivos',
    heroSubtitle: 'Dívidas antigas podem estar prescritas. Analisamos a viabilidade de defesa em execuções fiscais e cíveis.',
    features: ['Análise de Prescrição', 'Defesa em Execução Fiscal', 'Baixa de Restrições', 'Estudo de Viabilidade']
  },
  contracts: {
    id: 'contracts',
    title: 'Contratos e Societário',
    shortDesc: 'Elaboração e revisão de contratos empresariais.',
    icon: FileText,
    heroTitle: 'Assessoria Contratual',
    heroSubtitle: 'Elaboração e revisão de instrumentos contratuais para conferir maior segurança jurídica às suas relações comerciais.',
    features: ['Elaboração de Contratos', 'Revisão de Cláusulas', 'Alterações Societárias', 'Acordos de Sócios']
  }
};

export type ViewType = 'home' | 'practice_areas' | 'tax_hub' | keyof typeof SERVICES;

// Blog Articles
export interface BlogArticle {
  id: string;
  dbId?: string;
  title: string;
  excerpt: string;
  content: string;
  categories: string[]; // Array of category tags
  date: string;
  updatedAt?: string; // ISO date string for article:modified_time meta tag
  readTime: string;
  image: string;
  hasEbook?: boolean;
  ebookTitle?: string;
  ebookSubtitle?: string;
  ebookPdfUrl?: string;
  ebookCoverUrl?: string;
  viewCount?: number;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'isencao-ir-hiv',
    title: 'Isenção de Imposto de Renda para Portadores de HIV: O Entendimento Jurídico sobre a Ausência de Sintomas',
    excerpt: 'A evolução da medicina transformou o HIV em uma doença crônica manejável. Saiba por que a isenção de IR não depende de sintomas ativos e como garantir seu direito.',
    categories: ['Isenção Fiscal', 'Direito Tributário'],
    date: '15 Dez 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8 text-justify">A evolução da medicina transformou o diagnóstico do vírus da imunodeficiência humana (HIV) de uma condição outrora fatal em uma doença crônica perfeitamente manejável. Graças à eficácia da terapia antirretroviral (TARV), muitas pessoas vivem hoje décadas com saúde e plena qualidade de vida. No entanto, essa vitória da ciência trouxe consigo um paradoxo jurídico: frequentemente, a Receita Federal nega a isenção de Imposto de Renda a quem não apresenta sintomas ativos da AIDS. Essa prática pode ignorar a finalidade do benefício fiscal, que visa apoiar o tratamento contínuo e preservar a dignidade do paciente.</p>
      
      <p class="text-lg mb-6 text-justify">Para compreender o alcance desse direito, é preciso identificar as hipóteses legais. A isenção, prevista na Lei nº 7.713/1988, é destinada especificamente aos rendimentos de aposentadoria, pensões e reformas militares. Conforme o entendimento consolidado pelo STJ no Tema 1037, o benefício não se estende aos trabalhadores que ainda estão na ativa, focando naqueles que enfrentam os custos da saúde na inatividade.</p>
      
      <p class="text-lg mb-6 text-justify">Um dos maiores obstáculos reside no "mito dos sintomas". O Judiciário pacificou a questão através da Súmula 627 do STJ, estabelecendo que o contribuinte tem direito ao benefício independentemente da demonstração de sintomas contemporâneos. A justiça reconhece que o estado de saúde estável é fruto de disciplina e gastos constantes.</p>
      
      <p class="text-lg mb-6 text-justify">Além das aposentadorias, o direito pode se estender à previdência complementar (PGBL/VGBL) e reformas militares. Para viabilizar a análise, embora a lei mencione laudo oficial, a Súmula 598 do STJ permite que o magistrado reconheça a isenção com base em outras provas, como exames e relatórios particulares. É possível, ainda, pleitear a devolução de valores pagos indevidamente nos últimos cinco anos.</p>
      
      <p class="text-lg mb-6 text-justify">Por fim, a Lei 14.289/2022 garante o sigilo sobre a condição de saúde em processos administrativos e judiciais. A busca pela isenção é uma ferramenta de justiça social para garantir recursos necessários ao bem-estar e à longevidade.</p>
      
      <p class="text-xl font-semibold text-center text-primary">Saiba mais sobre seus direitos e agende um atendimento inicial para análise do seu caso.</p>
    `
  },
  {
    id: 'molestias-graves-lei',
    title: 'Lista Completa: Doenças que Garantem Isenção de Imposto de Renda',
    excerpt: 'A Lei 7.713/88 prevê isenção para aposentados com moléstias graves. Câncer, cardiopatia grave, Parkinson e outras 14 condições estão no rol. Confira se você tem direito.',
    categories: ['Isenção Fiscal', 'Direito Tributário'],
    date: '10 Dez 2024',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8 text-justify">A Lei 7.713/88, em seu artigo 6º, inciso XIV, estabelece um rol de doenças graves que garantem aos aposentados e pensionistas a <strong>isenção total do Imposto de Renda</strong> sobre seus proventos.</p>

      <h2>Lista oficial de doenças graves</h2>
      <p class="text-justify">As seguintes condições garantem o direito à isenção:</p>
      <ul>
        <li><strong>AIDS</strong> (Síndrome da Imunodeficiência Adquirida)</li>
        <li><strong>Alienação mental</strong></li>
        <li><strong>Cardiopatia grave</strong></li>
        <li><strong>Cegueira</strong> (inclusive monocular)</li>
        <li><strong>Contaminação por radiação</strong></li>
        <li><strong>Doença de Paget</strong> em estados avançados (Osteíte Deformante)</li>
        <li><strong>Doença de Parkinson</strong></li>
        <li><strong>Esclerose múltipla</strong></li>
        <li><strong>Espondiloartrose anquilosante</strong></li>
        <li><strong>Fibrose cística</strong> (Mucoviscidose)</li>
        <li><strong>Hanseníase</strong></li>
        <li><strong>Hepatopatia grave</strong></li>
        <li><strong>Nefropatia grave</strong></li>
        <li><strong>Neoplasia maligna</strong> (Câncer)</li>
        <li><strong>Paralisia irreversível e incapacitante</strong></li>
        <li><strong>Tuberculose ativa</strong></li>
      </ul>

      <h2>Importante: a lista não é taxativa</h2>
      <p class="text-justify">Apesar de a lei trazer um rol específico, a jurisprudência tem entendido que <strong>outras doenças graves podem garantir a isenção</strong>, especialmente quando:</p>
      <ul>
        <li>Causam incapacidade ou limitação significativa</li>
        <li>Exigem tratamento contínuo e dispendioso</li>
        <li>Afetam a qualidade de vida do aposentado</li>
      </ul>

      <h2>Não precisa estar incapacitado</h2>
      <p class="text-justify">Muitas pessoas deixam de buscar seu direito por acharem que precisam estar "muito doentes". Isso é um mito. A Súmula 627 do STJ é clara: <strong>não é necessário demonstrar sintomas atuais</strong> para ter direito à isenção.</p>

      <h2>Como comprovar a doença?</h2>
      <p class="text-justify">A comprovação é feita por meio de <strong>laudo médico</strong> que ateste:</p>
      <ul>
        <li>O diagnóstico da doença</li>
        <li>A data de início da enfermidade (se possível)</li>
        <li>CID (Classificação Internacional de Doenças)</li>
      </ul>
      <p class="text-justify">O laudo pode ser emitido por médico particular ou do SUS. Não é necessário perícia do INSS para o pedido judicial.</p>

      <h2>Benefícios da isenção</h2>
      <ul>
        <li><strong>Isenção permanente</strong> do IR sobre aposentadoria/pensão</li>
        <li><strong>Restituição</strong> dos valores pagos nos últimos 5 anos</li>
        <li><strong>Correção</strong> pela taxa SELIC</li>
        <li><strong>Extensão</strong> para previdência privada complementar</li>
      </ul>
    `
  },
  {
    id: 'restituicao-retroativa',
    title: 'Como Recuperar o IR Pago Indevidamente nos Últimos 5 Anos',
    excerpt: 'Além da isenção futura, é possível reaver todo o imposto retido nos últimos 60 meses. Entenda o processo de restituição e os documentos necessários.',
    categories: ['Isenção Fiscal'],
    date: '05 Dez 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8 text-justify">Se você tem direito à isenção de IR por moléstia grave e não sabia, provavelmente pagou imposto que não deveria. A boa notícia: <strong>você pode recuperar tudo o que foi retido nos últimos 5 anos</strong>, com correção monetária.</p>

      <h2>O que é a restituição retroativa?</h2>
      <p class="text-justify">Quando o direito à isenção é reconhecido, ele retroage à <strong>data do diagnóstico da doença</strong> ou, no máximo, aos últimos 5 anos (prazo prescricional). Todo o IR que foi descontado da sua aposentadoria ou pensão nesse período deve ser devolvido.</p>

      <h2>Como calcular quanto você pode receber?</h2>
      <p class="text-justify">O cálculo considera:</p>
      <ul>
        <li>Valor do IR retido mensalmente na fonte</li>
        <li>Número de meses (até 60 meses)</li>
        <li>Correção pela taxa SELIC acumulada</li>
      </ul>
      <p class="text-justify">Exemplo prático:</p>
      <blockquote class="border-l-4 border-accent pl-6 my-6">
        <p>Aposentado com retenção média de R$ 800/mês</p>
        <p>Período: 5 anos = 60 meses</p>
        <p>Valor principal: R$ 48.000</p>
        <p><strong>Com correção SELIC: aproximadamente R$ 65.000</strong></p>
      </blockquote>

      <h2>Passo a passo do processo</h2>
      <ol>
        <li><strong>Reunir documentação médica</strong> – laudos, exames, histórico de tratamento</li>
        <li><strong>Levantar os informes de rendimentos</strong> – dos últimos 5 anos</li>
        <li><strong>Calcular o valor devido</strong> – IR retido + correção SELIC</li>
        <li><strong>Ingressar com ação judicial</strong> – para reconhecimento do direito e restituição</li>
        <li><strong>Receber os valores</strong> – após trânsito em julgado ou tutela de urgência</li>
      </ol>

      <h2>Via administrativa ou judicial?</h2>
      <p class="text-justify">Embora seja possível pedir administrativamente junto ao INSS ou órgão pagador, a <strong>via judicial é mais vantajosa</strong> porque:</p>
      <ul>
        <li>É mais rápida (possibilidade de tutela de urgência)</li>
        <li>Garante a restituição retroativa completa</li>
        <li>Inclui correção pela SELIC desde cada retenção</li>
        <li>Vincula o órgão pagador à decisão</li>
      </ul>

      <h2>Prazo para requerer</h2>
      <p class="text-justify">O prazo prescricional é de <strong>5 anos</strong>. Isso significa que a cada mês que passa, você perde o direito de recuperar um mês de IR pago. Por isso, é importante agir rapidamente.</p>

      <h2>Documentos necessários</h2>
      <ul>
        <li>RG e CPF</li>
        <li>Comprovante de residência</li>
        <li>Laudo médico com diagnóstico e CID</li>
        <li>Informes de rendimentos (últimos 5 anos)</li>
        <li>Declarações de IR entregues (se houver)</li>
        <li>Extrato de pagamento do INSS ou contracheques</li>
      </ul>
    `
  },
  {
    id: 'direitos-demissao',
    title: 'Demissão: Conheça Todos os Seus Direitos Trabalhistas',
    excerpt: 'Verbas rescisórias, multa do FGTS, aviso prévio, seguro-desemprego. Um guia completo sobre o que você tem direito a receber ao ser desligado da empresa.',
    categories: ['Trabalho', 'Direito Trabalhista'],
    date: '28 Nov 2024',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8 text-justify">Ser demitido nunca é fácil, mas conhecer seus direitos pode fazer toda a diferença. Este guia explica <strong>tudo o que você tem direito a receber</strong> em cada modalidade de desligamento.</p>

      <h2>Demissão sem justa causa</h2>
      <p class="text-justify">Quando o empregador dispensa o funcionário sem motivo justificado, este tem direito a:</p>
      <ul>
        <li><strong>Saldo de salário</strong> – dias trabalhados no mês da demissão</li>
        <li><strong>Aviso prévio</strong> – trabalhado ou indenizado (30 dias + 3 dias por ano de serviço)</li>
        <li><strong>13º salário proporcional</strong> – 1/12 por mês trabalhado no ano</li>
        <li><strong>Férias vencidas + 1/3</strong> – se houver período completo não gozado</li>
        <li><strong>Férias proporcionais + 1/3</strong> – 1/12 por mês trabalhado</li>
        <li><strong>Multa de 40% do FGTS</strong> – sobre todo o saldo depositado</li>
        <li><strong>Saque do FGTS</strong> – liberação do saldo total</li>
        <li><strong>Seguro-desemprego</strong> – se cumprir os requisitos</li>
      </ul>

      <h2>Demissão por justa causa</h2>
      <p class="text-justify">Nas hipóteses do art. 482 da CLT (falta grave), o trabalhador recebe apenas:</p>
      <ul>
        <li>Saldo de salário</li>
        <li>Férias vencidas + 1/3 (se houver)</li>
      </ul>
      <p class="text-justify"><strong>Perde o direito a:</strong> aviso prévio, 13º proporcional, férias proporcionais, multa do FGTS, saque do FGTS e seguro-desemprego.</p>

      <h2>Pedido de demissão</h2>
      <p class="text-justify">Quando o empregado pede para sair, tem direito a:</p>
      <ul>
        <li>Saldo de salário</li>
        <li>13º proporcional</li>
        <li>Férias vencidas + 1/3</li>
        <li>Férias proporcionais + 1/3</li>
      </ul>
      <p class="text-justify"><strong>Não tem direito a:</strong> multa de 40%, saque do FGTS, seguro-desemprego. Deve cumprir aviso prévio ou ter desconto.</p>

      <h2>Acordo entre as partes (art. 484-A CLT)</h2>
      <p class="text-justify">Desde a Reforma Trabalhista, é possível fazer acordo:</p>
      <ul>
        <li>Aviso prévio – 50% se indenizado</li>
        <li>Multa do FGTS – 20% (metade)</li>
        <li>Saque do FGTS – até 80% do saldo</li>
        <li>Demais verbas – integrais</li>
        <li><strong>Sem direito</strong> a seguro-desemprego</li>
      </ul>

      <h2>Prazo para pagamento</h2>
      <p class="text-justify">A empresa tem <strong>até 10 dias corridos</strong> após o término do contrato para pagar todas as verbas rescisórias. O descumprimento gera multa equivalente a um salário.</p>

      <h2>O que fazer se não receber corretamente?</h2>
      <ol>
        <li>Guarde todos os documentos (TRCT, contracheques, carteira de trabalho)</li>
        <li>Compare os valores com o que deveria receber</li>
        <li>Procure orientação jurídica especializada</li>
        <li>Você tem até 2 anos após a demissão para reclamar na Justiça</li>
      </ol>
    `
  },
  {
    id: 'horas-extras-calculo',
    title: 'Horas Extras Não Pagas? Saiba Como Calcular e Cobrar',
    excerpt: 'Muitos trabalhadores têm direito a horas extras que nunca foram pagas. Aprenda a calcular corretamente e entenda o prazo para reclamar na Justiça.',
    categories: ['Trabalho', 'Direito Trabalhista'],
    date: '20 Nov 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8 text-justify">Trabalhou além do horário e não recebeu? Isso é mais comum do que parece. Entenda <strong>como calcular suas horas extras</strong> e o que fazer para cobrar o que é seu por direito.</p>

      <h2>O que são horas extras?</h2>
      <p class="text-justify">Horas extras são aquelas trabalhadas <strong>além da jornada regular</strong>. Para a maioria dos trabalhadores CLT, a jornada padrão é:</p>
      <ul>
        <li><strong>8 horas diárias</strong></li>
        <li><strong>44 horas semanais</strong></li>
      </ul>
      <p class="text-justify">Tudo o que exceder esses limites deve ser pago como hora extra.</p>

      <h2>Qual o valor da hora extra?</h2>
      <p class="text-justify">O adicional mínimo previsto na Constituição é de <strong>50%</strong> sobre o valor da hora normal:</p>
      <blockquote class="border-l-4 border-accent pl-6 my-6">
        <p><strong>Hora extra = Hora normal × 1,5</strong></p>
        <p>Exemplo: Salário R$ 2.200 / 220 horas = R$ 10,00/hora</p>
        <p>Hora extra: R$ 10,00 × 1,5 = <strong>R$ 15,00</strong></p>
      </blockquote>
      <p class="text-justify">Algumas convenções coletivas preveem adicional maior (60%, 70%, 100%).</p>

      <h2>Horas extras em domingos e feriados</h2>
      <p class="text-justify">O trabalho em dias de descanso tem adicional de <strong>100%</strong> (hora em dobro), salvo compensação:</p>
      <ul>
        <li>Hora extra em domingo/feriado = Hora normal × 2</li>
        <li>Exemplo: R$ 10,00 × 2 = R$ 20,00</li>
      </ul>

      <h2>Hora noturna</h2>
      <p class="text-justify">O trabalho entre 22h e 5h tem adicional de <strong>20%</strong> e a hora é "reduzida" (52min30seg = 1 hora):</p>
      <ul>
        <li>Hora noturna = Hora normal × 1,2</li>
        <li>Se for extra e noturna, os adicionais se acumulam</li>
      </ul>

      <h2>Reflexos das horas extras</h2>
      <p class="text-justify">As horas extras habituais refletem em outras verbas:</p>
      <ul>
        <li>13º salário</li>
        <li>Férias + 1/3</li>
        <li>FGTS + multa de 40%</li>
        <li>Aviso prévio</li>
        <li>DSR (Descanso Semanal Remunerado)</li>
      </ul>

      <h2>Como provar as horas extras?</h2>
      <p class="text-justify">As principais provas são:</p>
      <ul>
        <li><strong>Cartão de ponto</strong> – registros de entrada e saída</li>
        <li><strong>Testemunhas</strong> – colegas que presenciaram</li>
        <li><strong>E-mails e mensagens</strong> – com horários fora do expediente</li>
        <li><strong>Registros de sistema</strong> – logs de acesso, relatórios</li>
      </ul>
      <p class="text-justify">Se a empresa tem mais de 20 funcionários e não apresentar os cartões de ponto, presume-se verdadeira a jornada alegada pelo trabalhador.</p>

      <h2>Prazo para reclamar</h2>
      <p class="text-justify">Você pode cobrar as horas extras dos <strong>últimos 5 anos</strong>, mas precisa entrar com a ação em até <strong>2 anos após a demissão</strong>.</p>
    `
  },
  {
    id: 'assedio-moral-trabalho',
    title: 'Assédio Moral no Trabalho: Como Identificar e Agir',
    excerpt: 'Humilhações, cobranças excessivas e isolamento são formas de assédio. Saiba como documentar, denunciar e buscar reparação pelos danos sofridos.',
    categories: ['Trabalho', 'Direito Trabalhista'],
    date: '12 Nov 2024',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8 text-justify">O assédio moral no trabalho é uma violência silenciosa que afeta milhões de trabalhadores. Reconhecer os sinais e saber como agir é fundamental para <strong>proteger sua saúde mental e seus direitos</strong>.</p>

      <h2>O que caracteriza assédio moral?</h2>
      <p class="text-justify">Assédio moral é a <strong>exposição repetitiva do trabalhador a situações humilhantes e constrangedoras</strong> durante a jornada de trabalho. Características principais:</p>
      <ul>
        <li><strong>Repetição</strong> – condutas reiteradas ao longo do tempo</li>
        <li><strong>Intencionalidade</strong> – objetivo de desestabilizar a vítima</li>
        <li><strong>Direcionalidade</strong> – atinge pessoa ou grupo específico</li>
        <li><strong>Degradação</strong> – afeta dignidade e integridade psíquica</li>
      </ul>

      <h2>Exemplos de assédio moral</h2>
      <ul>
        <li>Gritos, xingamentos e humilhações públicas</li>
        <li>Atribuir tarefas impossíveis ou prazos irreais</li>
        <li>Isolar o trabalhador dos colegas</li>
        <li>Retirar funções sem justificativa</li>
        <li>Fazer críticas constantes sem fundamento</li>
        <li>Ignorar sistematicamente o funcionário</li>
        <li>Espalhar boatos ou fofocas</li>
        <li>Impedir promoções ou crescimento profissional</li>
        <li>Ridicularizar por características pessoais</li>
        <li>Controle excessivo (inclusive de idas ao banheiro)</li>
      </ul>

      <h2>Tipos de assédio moral</h2>
      <ul>
        <li><strong>Vertical descendente:</strong> do chefe para o subordinado (mais comum)</li>
        <li><strong>Vertical ascendente:</strong> do subordinado para o chefe</li>
        <li><strong>Horizontal:</strong> entre colegas do mesmo nível</li>
        <li><strong>Organizacional:</strong> práticas abusivas da própria empresa</li>
      </ul>

      <h2>Consequências para a vítima</h2>
      <p class="text-justify">O assédio moral pode causar sérios danos à saúde:</p>
      <ul>
        <li>Ansiedade e depressão</li>
        <li>Síndrome de burnout</li>
        <li>Distúrbios do sono</li>
        <li>Problemas gastrointestinais</li>
        <li>Baixa autoestima</li>
        <li>Isolamento social</li>
      </ul>

      <h2>Como documentar o assédio</h2>
      <p class="text-justify">A prova é essencial para responsabilizar o agressor:</p>
      <ol>
        <li><strong>Anote tudo</strong> – data, hora, local, testemunhas, o que foi dito/feito</li>
        <li><strong>Guarde provas</strong> – e-mails, mensagens, áudios (se permitido)</li>
        <li><strong>Busque testemunhas</strong> – colegas que presenciaram</li>
        <li><strong>Procure atendimento médico</strong> – laudo comprova o dano</li>
        <li><strong>Denuncie ao RH ou Compliance</strong> – formalize por escrito</li>
      </ol>

      <h2>Seus direitos</h2>
      <p class="text-justify">A vítima de assédio moral pode buscar:</p>
      <ul>
        <li><strong>Rescisão indireta</strong> – "justa causa do empregador" com todos os direitos</li>
        <li><strong>Indenização por danos morais</strong></li>
        <li><strong>Indenização por danos materiais</strong> (tratamentos médicos)</li>
        <li><strong>Estabilidade provisória</strong> se desenvolver doença ocupacional</li>
      </ul>

      <h2>Próximos passos</h2>
      <p class="text-justify">Se você está sofrendo assédio moral, não fique em silêncio. Procure ajuda psicológica e orientação jurídica especializada para entender as melhores opções para o seu caso.</p>
    `
  },
  {
    id: 'direitos-gestante-demitida',
    title: 'Demitida Grávida no Contrato de Experiência? Entenda Seus Direitos e a Proteção do Seu Bebê',
    excerpt: 'Muitas gestantes acreditam que perderam seus direitos ao serem demitidas em contrato de experiência ou sem avisar sobre a gravidez. A lei e os tribunais dizem o contrário.',
    categories: ['Trabalho', 'Direitos da Gestante'],
    date: '15 Jan 2025',
    readTime: '5 min',
    image: gestanteProfissional,
    content: `
      <p class="text-xl font-medium mb-8 text-justify">Receber a notícia de uma demissão é sempre um momento delicado, mas, quando isso acontece durante uma gestação, a insegurança se multiplica instantaneamente. O medo de ficar sem renda para o enxoval e, principalmente, a angústia pela perda do plano de saúde no momento em que mais se precisa de acompanhamento médico são dores reais e urgentes.</p>

      <p class="text-lg mb-6 text-justify">Diante desse cenário, muitas trabalhadoras acreditam que, por estarem em contrato de experiência ou por não terem avisado o patrão sobre a gravidez antes da dispensa, perderam seus direitos — <strong>mas a legislação brasileira e o entendimento atual dos tribunais dizem exatamente o contrário</strong>.</p>

      <h2>O mito do aviso prévio sobre a gravidez</h2>
      <p class="text-lg mb-6 text-justify">Um dos maiores mitos no mercado de trabalho é a ideia de que a funcionária precisa avisar a empresa sobre a gravidez para ter direito à estabilidade. O <strong>Supremo Tribunal Federal (STF)</strong> firmou um entendimento baseado na chamada <strong>Responsabilidade Objetiva</strong>, o que significa, em termos simples, que o fator determinante é a <strong>data da concepção biológica</strong>, e não a data da comunicação ao empregador.</p>

      <p class="text-lg mb-6 text-justify">Se o ultrassom confirmar que, no dia da demissão, você já estava grávida — mesmo que nem você e nem seu chefe soubessem — a lei protege o seu emprego e o sustento do seu bebê, pois a prioridade jurídica é garantir a vida e o bem-estar da criança que vai nascer.</p>

      <h2>Gestante em contrato de experiência tem estabilidade?</h2>
      <p class="text-lg mb-6 text-justify">Outra situação muito comum que gera desistência de direitos é quando a empresa alega que, por se tratar de um contrato de experiência que chegou ao fim do prazo, não deve nada à funcionária. <strong>É preciso ter muito cuidado com essa informação.</strong></p>

      <p class="text-lg mb-6 text-justify">O <strong>Tribunal Superior do Trabalho (TST)</strong> reforçou recentemente o entendimento de que a <strong>gestante em contrato de experiência tem, sim, direito à estabilidade provisória</strong>. A lógica é constitucional: a proteção à maternidade está acima da natureza do contrato e, portanto, se você foi dispensada no 45º ou no 90º dia de experiência e estava grávida, essa dispensa pode ser considerada nula.</p>

      <blockquote class="border-l-4 border-accent pl-6 my-6 bg-muted/30 py-4">
        <p class="text-lg font-medium"><strong>Importante:</strong> Vale um alerta para contratos de trabalho temporário, aqueles regidos por lei específica e feitos via agências, onde a jurisprudência atual tende a não reconhecer a mesma estabilidade.</p>
      </blockquote>

      <h2>Reintegração ou indenização: o que a lei garante</h2>
      <p class="text-lg mb-6 text-justify">O objetivo principal dessa proteção legal é a <strong>reintegração</strong>, garantindo que a gestante volte ao trabalho, receba seus salários e tenha seu plano de saúde restabelecido imediatamente, evitando as carências que um novo convênio exigiria para cobrir o parto.</p>

      <p class="text-lg mb-6 text-justify">No entanto, sabemos que nem sempre o clima para o retorno é amigável e, quando voltar se torna insustentável devido a humilhações ou animosidade, a Justiça pode converter essa obrigação em uma <strong>indenização substitutiva</strong>, obrigando a empresa a pagar todos os salários e reflexos compreendidos entre a data da demissão até cinco meses após o parto.</p>

      <h2>E se a gestante pediu demissão?</h2>
      <p class="text-lg mb-6 text-justify">Mesmo nos casos em que a gestante pediu demissão, seja por desconhecimento ou coação, a lei oferece uma camada extra de proteção. O <strong>artigo 500 da CLT</strong> determina que o pedido de demissão de uma funcionária gestante só é válido se for feito com a assistência do Sindicato da categoria ou autoridade competente.</p>

      <p class="text-lg mb-6 text-justify">Um pedido feito apenas "de boca" ou em uma carta simples, sem essa homologação oficial, <strong>pode ser anulado judicialmente</strong>, revertendo-se a situação para uma dispensa sem justa causa com todos os direitos garantidos.</p>

      <h2>Próximos passos</h2>
      <p class="text-lg mb-6 text-justify">Se você está passando por isso, lembre-se de que o tempo é precioso: reúna seus documentos, especialmente o ultrassom com a idade gestacional e o termo de rescisão, e busque orientação especializada, pois <strong>garantir seus direitos é o primeiro passo para garantir a segurança do seu filho</strong>.</p>

      <p class="text-xl font-semibold text-center text-primary">Agende uma consulta para análise do seu caso e defesa dos seus direitos.</p>
    `
  },
  {
    id: 'horario-britanico-ponto',
    title: 'A Transparência do Ponto: Por que a "Perfeição" Matemática pode Invalidar seu Cartão Ponto',
    excerpt: 'Entenda a importância das variações reais de jornada e os riscos do "horário britânico" para a segurança jurídica das empresas.',
    categories: ['Trabalho', 'Direito Empresarial'],
    date: '27 Jan 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8 text-justify">No universo das relações trabalhistas, a busca por uma organização documental impecável muitas vezes esbarra em um conceito que, embora pareça virtuoso, tornou-se uma armadilha jurídica: o chamado <strong>"horário britânico"</strong>. A validade de um controle de jornada não reside na simetria dos números, mas na sua fidedignidade, e é sobre essa linha tênue entre a organização e a presunção de fraude que as empresas devem se pautar para evitar condenações inesperadas em tribunais.</p>

      <h2>O que é o "horário britânico"?</h2>
      <p class="text-lg mb-6 text-justify">O termo "horário britânico" refere-se a registros de ponto que apresentam <strong>marcações invariavelmente idênticas todos os dias</strong>, como uma entrada rigorosa às 07:30 e saída exatamente às 17:30, sem qualquer variação de minutos ao longo de meses. O nome remete à fama mundial de pontualidade dos britânicos, mas, no contexto do Direito do Trabalho brasileiro, essa pontualidade "robótica" é vista com extrema desconfiança.</p>

      <p class="text-lg mb-6 text-justify">O pensamento limpo e ordenado sobre a natureza humana revela que é natural haver pequenas oscilações diárias. Por essa razão, o <strong>Tribunal Superior do Trabalho consolidou, por meio da Súmula 338, item III</strong>, o entendimento de que registros que não apresentam variações reais de minutos são considerados inválidos como prova, invertendo o ônus de provar a jornada real contra a empresa.</p>

      <h2>Como garantir registros válidos?</h2>
      <p class="text-lg mb-6 text-justify">Para garantir que a defesa em um processo seja sólida, o registro deve refletir a realidade crua dos fatos. <strong>Pequenas variações</strong>, como marcar a entrada às 07:29 em um dia, 07:27 em outro e 07:35 em um terceiro, são a prova máxima de que o controle era feito pelo próprio empregado de forma honesta.</p>

      <p class="text-lg mb-6 text-justify">Essas oscilações são amparadas legalmente pelo <strong>Artigo 58, §1º da CLT</strong>, que estabelece uma margem de tolerância de cinco minutos em cada marcação, não excedendo dez minutos diários. Quando o documento apresenta essas nuances, ele mantém sua idoneidade, e o dever de provar a existência de horas extras volta a ser do trabalhador.</p>

      <h2>A importância da coerência documental</h2>
      <p class="text-lg mb-6 text-justify">Além da análise visual das marcações, a segurança jurídica de uma empresa é fortalecida pela <strong>consistência entre diferentes documentos</strong>. Um sistema de ponto confiável deve "conversar" com o recibo de pagamento, o holerite.</p>

      <p class="text-lg mb-6 text-justify">Se um cartão de ponto registra uma falta ou advertência de forma fidedigna, esse fato deve ser refletido com exatidão no desconto salarial correspondente. A lógica jurídica aplicada é de que, se o sistema é utilizado rigorosamente para punir ausências, ele também o seria para registrar e remunerar o labor extraordinário, caso este ocorresse. Essa coerência documental elimina teses abstratas e foca nos componentes essenciais da verdade factual.</p>

      <h2>Medidas preventivas recomendadas</h2>
      <p class="text-lg mb-6 text-justify">A transparência é a melhor estratégia para evitar que a defesa trabalhista desmorone por falta de bases sólidas:</p>
      <ul>
        <li><strong>Instruir os colaboradores</strong> sobre a importância de registrar o horário exato, sem arredondamentos</li>
        <li><strong>Auditar periodicamente</strong> se as folhas de ponto não estão se tornando "britânicas"</li>
        <li><strong>Aceitar a natureza humana</strong> — com seus pequenos atrasos e antecipações</li>
      </ul>

      <p class="text-lg mb-6 text-justify">Ao aceitar essas variações naturais, a empresa constrói registros muito mais resistentes a contestações judiciais. Afinal, a boa escrita de um destino jurídico seguro começa no relógio de ponto, garantindo que cada minuto registrado seja um aliado fiel da justiça e da integridade corporativa.</p>

      <p class="text-xl font-semibold text-center text-primary">Precisa de orientação sobre gestão de ponto e segurança trabalhista? Agende uma consulta.</p>
    `
  }
];
