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
  content: string;
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
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8">A legislação brasileira assegura aos portadores do vírus HIV o direito à isenção do Imposto de Renda sobre proventos de aposentadoria, reforma ou pensão. O mais importante: <strong>você não precisa estar doente ou apresentar sintomas para ter esse direito</strong>.</p>
      
      <h2>O que diz a Súmula 627 do STJ?</h2>
      <p>O Superior Tribunal de Justiça consolidou o entendimento na Súmula 627:</p>
      <blockquote class="border-l-4 border-accent pl-6 my-6 italic text-lg">"O contribuinte faz jus à concessão ou à manutenção da isenção do imposto de renda, não se lhe exigindo a demonstração da contemporaneidade dos sintomas da doença nem da recidiva da enfermidade."</blockquote>
      <p>Isso significa que basta ser portador do HIV para ter direito à isenção, independentemente de:</p>
      <ul>
        <li>Apresentar sintomas ativos</li>
        <li>Ter desenvolvido AIDS</li>
        <li>Estar em tratamento</li>
        <li>Ter carga viral detectável ou indetectável</li>
      </ul>

      <h2>Quem tem direito?</h2>
      <p>A isenção se aplica a:</p>
      <ul>
        <li><strong>Aposentados do INSS</strong> (por idade, tempo de contribuição ou invalidez)</li>
        <li><strong>Aposentados do serviço público</strong> (federal, estadual ou municipal)</li>
        <li><strong>Militares reformados</strong></li>
        <li><strong>Pensionistas</strong> (que recebem pensão por morte)</li>
        <li><strong>Beneficiários de previdência privada complementar</strong></li>
      </ul>

      <h2>Como funciona a restituição retroativa?</h2>
      <p>Além de parar de pagar o imposto a partir do diagnóstico, você pode <strong>recuperar todo o IR retido nos últimos 5 anos</strong>. Esse valor é corrigido pela taxa SELIC e pode representar uma quantia significativa.</p>
      <p>Por exemplo: se você teve R$ 500 retidos mensalmente, pode ter direito a receber mais de R$ 30.000 de volta.</p>

      <h2>Sigilo absoluto garantido</h2>
      <p>A Lei 14.289/2022 garante que processos envolvendo HIV tramitem em <strong>segredo de justiça</strong>. Seu diagnóstico não será exposto em nenhum momento do processo. Isso inclui:</p>
      <ul>
        <li>Processos judiciais sob sigilo</li>
        <li>Documentos protegidos</li>
        <li>Nenhuma informação pública sobre sua condição</li>
      </ul>

      <h2>Documentos necessários</h2>
      <p>Para requerer a isenção, você precisará de:</p>
      <ul>
        <li>Laudo médico atestando a condição de portador do HIV</li>
        <li>Documentos pessoais (RG, CPF)</li>
        <li>Comprovante de aposentadoria ou pensão</li>
        <li>Declarações de IR dos últimos 5 anos (para restituição)</li>
      </ul>

      <h2>Próximos passos</h2>
      <p>O processo pode ser feito administrativamente junto ao órgão pagador ou judicialmente. A via judicial costuma ser mais rápida e garante a restituição dos valores passados.</p>
    `
  },
  {
    id: 'molestias-graves-lei',
    title: 'Lista Completa: Doenças que Garantem Isenção de Imposto de Renda',
    excerpt: 'A Lei 7.713/88 prevê isenção para aposentados com moléstias graves. Câncer, cardiopatia grave, Parkinson e outras 14 condições estão no rol. Confira se você tem direito.',
    category: 'Isenção Fiscal',
    date: '10 Dez 2024',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8">A Lei 7.713/88, em seu artigo 6º, inciso XIV, estabelece um rol de doenças graves que garantem aos aposentados e pensionistas a <strong>isenção total do Imposto de Renda</strong> sobre seus proventos.</p>

      <h2>Lista oficial de doenças graves</h2>
      <p>As seguintes condições garantem o direito à isenção:</p>
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
      <p>Apesar de a lei trazer um rol específico, a jurisprudência tem entendido que <strong>outras doenças graves podem garantir a isenção</strong>, especialmente quando:</p>
      <ul>
        <li>Causam incapacidade ou limitação significativa</li>
        <li>Exigem tratamento contínuo e dispendioso</li>
        <li>Afetam a qualidade de vida do aposentado</li>
      </ul>

      <h2>Não precisa estar incapacitado</h2>
      <p>Muitas pessoas deixam de buscar seu direito por acharem que precisam estar "muito doentes". Isso é um mito. A Súmula 627 do STJ é clara: <strong>não é necessário demonstrar sintomas atuais</strong> para ter direito à isenção.</p>

      <h2>Como comprovar a doença?</h2>
      <p>A comprovação é feita por meio de <strong>laudo médico</strong> que ateste:</p>
      <ul>
        <li>O diagnóstico da doença</li>
        <li>A data de início da enfermidade (se possível)</li>
        <li>CID (Classificação Internacional de Doenças)</li>
      </ul>
      <p>O laudo pode ser emitido por médico particular ou do SUS. Não é necessário perícia do INSS para o pedido judicial.</p>

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
    category: 'Isenção Fiscal',
    date: '05 Dez 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8">Se você tem direito à isenção de IR por moléstia grave e não sabia, provavelmente pagou imposto que não deveria. A boa notícia: <strong>você pode recuperar tudo o que foi retido nos últimos 5 anos</strong>, com correção monetária.</p>

      <h2>O que é a restituição retroativa?</h2>
      <p>Quando o direito à isenção é reconhecido, ele retroage à <strong>data do diagnóstico da doença</strong> ou, no máximo, aos últimos 5 anos (prazo prescricional). Todo o IR que foi descontado da sua aposentadoria ou pensão nesse período deve ser devolvido.</p>

      <h2>Como calcular quanto você pode receber?</h2>
      <p>O cálculo considera:</p>
      <ul>
        <li>Valor do IR retido mensalmente na fonte</li>
        <li>Número de meses (até 60 meses)</li>
        <li>Correção pela taxa SELIC acumulada</li>
      </ul>
      <p>Exemplo prático:</p>
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
      <p>Embora seja possível pedir administrativamente junto ao INSS ou órgão pagador, a <strong>via judicial é mais vantajosa</strong> porque:</p>
      <ul>
        <li>É mais rápida (possibilidade de tutela de urgência)</li>
        <li>Garante a restituição retroativa completa</li>
        <li>Inclui correção pela SELIC desde cada retenção</li>
        <li>Vincula o órgão pagador à decisão</li>
      </ul>

      <h2>Prazo para requerer</h2>
      <p>O prazo prescricional é de <strong>5 anos</strong>. Isso significa que a cada mês que passa, você perde o direito de recuperar um mês de IR pago. Por isso, é importante agir rapidamente.</p>

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
    category: 'Trabalho',
    date: '28 Nov 2024',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8">Ser demitido nunca é fácil, mas conhecer seus direitos pode fazer toda a diferença. Este guia explica <strong>tudo o que você tem direito a receber</strong> em cada modalidade de desligamento.</p>

      <h2>Demissão sem justa causa</h2>
      <p>Quando o empregador dispensa o funcionário sem motivo justificado, este tem direito a:</p>
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
      <p>Nas hipóteses do art. 482 da CLT (falta grave), o trabalhador recebe apenas:</p>
      <ul>
        <li>Saldo de salário</li>
        <li>Férias vencidas + 1/3 (se houver)</li>
      </ul>
      <p><strong>Perde o direito a:</strong> aviso prévio, 13º proporcional, férias proporcionais, multa do FGTS, saque do FGTS e seguro-desemprego.</p>

      <h2>Pedido de demissão</h2>
      <p>Quando o empregado pede para sair, tem direito a:</p>
      <ul>
        <li>Saldo de salário</li>
        <li>13º proporcional</li>
        <li>Férias vencidas + 1/3</li>
        <li>Férias proporcionais + 1/3</li>
      </ul>
      <p><strong>Não tem direito a:</strong> multa de 40%, saque do FGTS, seguro-desemprego. Deve cumprir aviso prévio ou ter desconto.</p>

      <h2>Acordo entre as partes (art. 484-A CLT)</h2>
      <p>Desde a Reforma Trabalhista, é possível fazer acordo:</p>
      <ul>
        <li>Aviso prévio – 50% se indenizado</li>
        <li>Multa do FGTS – 20% (metade)</li>
        <li>Saque do FGTS – até 80% do saldo</li>
        <li>Demais verbas – integrais</li>
        <li><strong>Sem direito</strong> a seguro-desemprego</li>
      </ul>

      <h2>Prazo para pagamento</h2>
      <p>A empresa tem <strong>até 10 dias corridos</strong> após o término do contrato para pagar todas as verbas rescisórias. O descumprimento gera multa equivalente a um salário.</p>

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
    category: 'Trabalho',
    date: '20 Nov 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8">Trabalhou além do horário e não recebeu? Isso é mais comum do que parece. Entenda <strong>como calcular suas horas extras</strong> e o que fazer para cobrar o que é seu por direito.</p>

      <h2>O que são horas extras?</h2>
      <p>Horas extras são aquelas trabalhadas <strong>além da jornada regular</strong>. Para a maioria dos trabalhadores CLT, a jornada padrão é:</p>
      <ul>
        <li><strong>8 horas diárias</strong></li>
        <li><strong>44 horas semanais</strong></li>
      </ul>
      <p>Tudo o que exceder esses limites deve ser pago como hora extra.</p>

      <h2>Qual o valor da hora extra?</h2>
      <p>O adicional mínimo previsto na Constituição é de <strong>50%</strong> sobre o valor da hora normal:</p>
      <blockquote class="border-l-4 border-accent pl-6 my-6">
        <p><strong>Hora extra = Hora normal × 1,5</strong></p>
        <p>Exemplo: Salário R$ 2.200 / 220 horas = R$ 10,00/hora</p>
        <p>Hora extra: R$ 10,00 × 1,5 = <strong>R$ 15,00</strong></p>
      </blockquote>
      <p>Algumas convenções coletivas preveem adicional maior (60%, 70%, 100%).</p>

      <h2>Horas extras em domingos e feriados</h2>
      <p>O trabalho em dias de descanso tem adicional de <strong>100%</strong> (hora em dobro), salvo compensação:</p>
      <ul>
        <li>Hora extra em domingo/feriado = Hora normal × 2</li>
        <li>Exemplo: R$ 10,00 × 2 = R$ 20,00</li>
      </ul>

      <h2>Hora noturna</h2>
      <p>O trabalho entre 22h e 5h tem adicional de <strong>20%</strong> e a hora é "reduzida" (52min30seg = 1 hora):</p>
      <ul>
        <li>Hora noturna = Hora normal × 1,2</li>
        <li>Se for extra e noturna, os adicionais se acumulam</li>
      </ul>

      <h2>Reflexos das horas extras</h2>
      <p>As horas extras habituais refletem em outras verbas:</p>
      <ul>
        <li>13º salário</li>
        <li>Férias + 1/3</li>
        <li>FGTS + multa de 40%</li>
        <li>Aviso prévio</li>
        <li>DSR (Descanso Semanal Remunerado)</li>
      </ul>

      <h2>Como provar as horas extras?</h2>
      <p>As principais provas são:</p>
      <ul>
        <li><strong>Cartão de ponto</strong> – registros de entrada e saída</li>
        <li><strong>Testemunhas</strong> – colegas que presenciaram</li>
        <li><strong>E-mails e mensagens</strong> – com horários fora do expediente</li>
        <li><strong>Registros de sistema</strong> – logs de acesso, relatórios</li>
      </ul>
      <p>Se a empresa tem mais de 20 funcionários e não apresentar os cartões de ponto, presume-se verdadeira a jornada alegada pelo trabalhador.</p>

      <h2>Prazo para reclamar</h2>
      <p>Você pode cobrar as horas extras dos <strong>últimos 5 anos</strong>, mas precisa entrar com a ação em até <strong>2 anos após a demissão</strong>.</p>
    `
  },
  {
    id: 'assedio-moral-trabalho',
    title: 'Assédio Moral no Trabalho: Como Identificar e Agir',
    excerpt: 'Humilhações, cobranças excessivas e isolamento são formas de assédio. Saiba como documentar, denunciar e buscar reparação pelos danos sofridos.',
    category: 'Trabalho',
    date: '12 Nov 2024',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    content: `
      <p class="text-xl font-medium mb-8">O assédio moral no trabalho é uma violência silenciosa que afeta milhões de trabalhadores. Reconhecer os sinais e saber como agir é fundamental para <strong>proteger sua saúde mental e seus direitos</strong>.</p>

      <h2>O que caracteriza assédio moral?</h2>
      <p>Assédio moral é a <strong>exposição repetitiva do trabalhador a situações humilhantes e constrangedoras</strong> durante a jornada de trabalho. Características principais:</p>
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
      <p>O assédio moral pode causar sérios danos à saúde:</p>
      <ul>
        <li>Ansiedade e depressão</li>
        <li>Síndrome de burnout</li>
        <li>Distúrbios do sono</li>
        <li>Problemas gastrointestinais</li>
        <li>Baixa autoestima</li>
        <li>Isolamento social</li>
      </ul>

      <h2>Como documentar o assédio</h2>
      <p>A prova é essencial para responsabilizar o agressor:</p>
      <ol>
        <li><strong>Anote tudo</strong> – data, hora, local, testemunhas, o que foi dito/feito</li>
        <li><strong>Guarde provas</strong> – e-mails, mensagens, áudios (se permitido)</li>
        <li><strong>Busque testemunhas</strong> – colegas que presenciaram</li>
        <li><strong>Procure atendimento médico</strong> – laudo comprova o dano</li>
        <li><strong>Denuncie ao RH ou Compliance</strong> – formalize por escrito</li>
      </ol>

      <h2>Seus direitos</h2>
      <p>A vítima de assédio moral pode buscar:</p>
      <ul>
        <li><strong>Rescisão indireta</strong> – "justa causa do empregador" com todos os direitos</li>
        <li><strong>Indenização por danos morais</strong></li>
        <li><strong>Indenização por danos materiais</strong> (tratamentos médicos)</li>
        <li><strong>Estabilidade provisória</strong> se desenvolver doença ocupacional</li>
      </ul>

      <h2>Próximos passos</h2>
      <p>Se você está sofrendo assédio moral, não fique em silêncio. Procure ajuda psicológica e orientação jurídica especializada para entender as melhores opções para o seu caso.</p>
    `
  }
];
