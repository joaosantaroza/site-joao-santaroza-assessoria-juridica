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
