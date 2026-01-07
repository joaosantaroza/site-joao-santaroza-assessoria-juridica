import { 
  Lock, 
  Activity, 
  Shield, 
  Users, 
  Clock, 
  FileText,
  LucideIcon 
} from 'lucide-react';

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
  lawyerPhoto: "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
    shortDesc: 'Direito garantido pelo STJ para portadores do vírus. Processo sigiloso.',
    icon: Lock, 
    heroTitle: 'Isenção de IR: Direito Garantido e Sigiloso',
    heroSubtitle: 'Se você é portador do HIV (mesmo assintomático), a lei garante a isenção total sobre sua aposentadoria ou pensão. Recuperamos os valores dos últimos 5 anos sem expor sua condição.',
    features: [
      'Isenção para Assintomáticos (Súmula 627 STJ)',
      'Sigilo Absoluto (Lei 14.289)',
      'Restituição Retroativa (5 anos)',
      'Inclusão de Previdência Privada'
    ]
  },
  general_tax: {
    id: 'general_tax',
    title: 'Isenção por Moléstia Grave',
    shortDesc: 'Câncer, Cardiopatia e outras condições da Lei 7.713/88.',
    icon: Activity,
    heroTitle: 'Alívio Fiscal por Motivo de Saúde',
    heroSubtitle: 'Aposentados e reformados com doenças graves têm direito legal de parar de pagar imposto de renda e focar os recursos na saúde.',
    features: ['Análise de Laudos', 'Rol da Lei 7.713/88', 'Restituição de Valores Pagos', 'Isenção Vitalícia']
  },
  unlock: {
    id: 'unlock',
    title: 'Desbloqueio de Contas',
    shortDesc: 'Devolvemos o fluxo de caixa para sua empresa respirar.',
    icon: Shield,
    heroTitle: 'Sua empresa travou? Nós destravamos.',
    heroSubtitle: 'Bloqueios judiciais (SISBAJUD) sufocam o negócio. Atuamos com urgência para liberar contas, impugnar penhoras indevidas e devolver o oxigênio financeiro.',
    features: ['Defesa contra Teimosinha', 'Impugnação de Penhora', 'Tutela de Urgência', 'Liberação de Capital de Giro']
  },
  labor: {
    id: 'labor',
    title: 'Direito do Trabalho',
    shortDesc: 'Soluções para Empresas e Empregados.',
    icon: Users,
    heroTitle: 'Equilíbrio nas Relações de Trabalho',
    heroSubtitle: 'Atuamos de forma técnica tanto na defesa de empresas (mitigação de passivos) quanto na garantia de direitos de empregados.',
    features: [
      'Defesa Patronal em Reclamatórias', 
      'Cálculos Rescisórios Precisos', 
      'Reconhecimento de Vínculo',
      'Acordos Extrajudiciais'
    ]
  },
  prescription: {
    id: 'prescription',
    title: 'Gestão de Passivos',
    shortDesc: 'Análise de prescrição de dívidas antigas.',
    icon: Clock,
    heroTitle: 'Limpeza de Passivo Tributário e Cível',
    heroSubtitle: 'Dívidas antigas podem estar prescritas. Analisamos a inércia processual para extinguir execuções fiscais e bancárias que não deveriam mais existir.',
    features: ['Análise de Prescrição Intercorrente', 'Defesa em Execução Fiscal', 'Baixa de Restrições', 'Extinção de Processos']
  },
  contracts: {
    id: 'contracts',
    title: 'Contratos e Societário',
    shortDesc: 'Blindagem jurídica através de contratos sólidos.',
    icon: FileText,
    heroTitle: 'Engenharia Contratual',
    heroSubtitle: 'Um contrato mal feito é um passivo oculto. Elaboramos e revisamos instrumentos para garantir previsibilidade e segurança nas suas relações comerciais.',
    features: ['Elaboração de Contratos Comerciais', 'Revisão de Cláusulas de Risco', 'Alterações de Contrato Social', 'Acordos de Sócios']
  }
};

export type ViewType = 'home' | 'practice_areas' | 'tax_hub' | keyof typeof SERVICES;

// Blog Articles
export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'isencao-ir-hiv',
    title: 'Isenção de IR para Portadores de HIV: Direito Mesmo Sem Sintomas',
    excerpt: 'O STJ já consolidou: portadores do HIV têm direito à isenção total de imposto de renda sobre aposentadorias e pensões, independentemente de apresentarem sintomas. Saiba como requerer.',
    category: 'Isenção Fiscal',
    date: '15 Dez 2024',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'molestias-graves-lei',
    title: 'Lista Completa: Doenças que Garantem Isenção de Imposto de Renda',
    excerpt: 'A Lei 7.713/88 prevê isenção para aposentados com moléstias graves. Câncer, cardiopatia grave, Parkinson e outras 14 condições estão no rol. Confira se você tem direito.',
    category: 'Isenção Fiscal',
    date: '10 Dez 2024',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'restituicao-retroativa',
    title: 'Como Recuperar o IR Pago Indevidamente nos Últimos 5 Anos',
    excerpt: 'Além da isenção futura, é possível reaver todo o imposto retido nos últimos 60 meses. Entenda o processo de restituição e os documentos necessários.',
    category: 'Isenção Fiscal',
    date: '05 Dez 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'direitos-demissao',
    title: 'Demissão: Conheça Todos os Seus Direitos Trabalhistas',
    excerpt: 'Verbas rescisórias, multa do FGTS, aviso prévio, seguro-desemprego. Um guia completo sobre o que você tem direito a receber ao ser desligado da empresa.',
    category: 'Trabalho',
    date: '28 Nov 2024',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'horas-extras-calculo',
    title: 'Horas Extras Não Pagas? Saiba Como Calcular e Cobrar',
    excerpt: 'Muitos trabalhadores têm direito a horas extras que nunca foram pagas. Aprenda a calcular corretamente e entenda o prazo para reclamar na Justiça.',
    category: 'Trabalho',
    date: '20 Nov 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'assedio-moral-trabalho',
    title: 'Assédio Moral no Trabalho: Como Identificar e Agir',
    excerpt: 'Humilhações, cobranças excessivas e isolamento são formas de assédio. Saiba como documentar, denunciar e buscar reparação pelos danos sofridos.',
    category: 'Trabalho',
    date: '12 Nov 2024',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];
