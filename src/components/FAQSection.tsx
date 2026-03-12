import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionTitle } from "./ui/SectionTitle";
import { FAQSchema } from "./seo/FAQSchema";

const faqs = [
  {
    category: "Isenção de Imposto de Renda",
    questions: [
      {
        question: "Quem tem direito à isenção de imposto de renda por doença grave?",
        answer: "Aposentados e pensionistas diagnosticados com doenças graves previstas em lei, como câncer, cardiopatia grave, esclerose múltipla, AIDS, entre outras listadas no art. 6º, XIV, da Lei 7.713/88, podem ter direito à isenção do imposto de renda sobre seus proventos."
      },
      {
        question: "É possível recuperar o imposto de renda pago nos últimos anos?",
        answer: "Sim. Caso você tenha direito à isenção e tenha pago imposto de renda nos últimos 5 anos, é possível solicitar a restituição dos valores pagos indevidamente, devidamente corrigidos."
      },
      {
        question: "Preciso apresentar laudo médico oficial para obter a isenção?",
        answer: "A legislação prevê a necessidade de laudo pericial emitido por serviço médico oficial. No entanto, a jurisprudência tem admitido laudos de médicos particulares como prova para fins judiciais, desde que fundamentados e conclusivos."
      },
      {
        question: "A doença precisa estar em fase ativa para manter a isenção?",
        answer: "Não. O Superior Tribunal de Justiça já consolidou o entendimento de que a isenção permanece mesmo após a cura clínica da doença, considerando a possibilidade de recidiva e os efeitos do tratamento."
      }
    ]
  },
  {
    category: "Direito Trabalhista",
    questions: [
      {
        question: "Qual o prazo para entrar com uma ação trabalhista?",
        answer: "O trabalhador tem até 2 anos após o término do contrato de trabalho para ajuizar a ação, podendo reclamar direitos dos últimos 5 anos trabalhados."
      },
      {
        question: "O que são verbas rescisórias e quais tenho direito?",
        answer: "São valores devidos ao trabalhador no momento da rescisão do contrato, como saldo de salário, aviso prévio, férias proporcionais, 13º proporcional, FGTS e multa de 40%, variando conforme o tipo de desligamento."
      }
    ]
  },
  {
    category: "Direito Previdenciário",
    questions: [
      {
        question: "Tive meu benefício negado pelo INSS. O que posso fazer?",
        answer: "É possível interpor recurso administrativo junto ao INSS ou buscar a via judicial para revisão da decisão. Cada caso deve ser analisado individualmente para definição da estratégia mais adequada."
      },
      {
        question: "Como funciona a aposentadoria especial?",
        answer: "A aposentadoria especial é destinada a trabalhadores expostos a agentes nocivos à saúde, como ruído, calor ou produtos químicos. Os requisitos incluem tempo de contribuição em atividade especial e comprovação da exposição através de documentos técnicos."
      }
    ]
  },
  {
    category: "Recuperação de Contas Digitais",
    questions: [
      {
        question: "Minha conta do Instagram foi hackeada. É possível recuperar judicialmente?",
        answer: "Sim. Quando os canais internos da Meta falham, é possível ingressar com ação judicial pedindo tutela de urgência para recuperação imediata da conta, além de indenização por danos morais e materiais. O Marco Civil da Internet e o Código de Defesa do Consumidor fundamentam a responsabilidade da plataforma pela segurança das contas dos usuários."
      },
      {
        question: "A Meta pode ser processada no Brasil por bloquear minha conta sem motivo?",
        answer: "Sim. A Meta possui representação no Brasil e responde perante o Judiciário brasileiro. Já há farta jurisprudência reconhecendo a responsabilidade da plataforma por bloqueios indevidos e falhas de segurança, com condenações em danos morais e obrigações de restabelecimento de acesso."
      },
      {
        question: "Minha conta do Mercado Livre foi bloqueada e há saldo retido. O que fazer?",
        answer: "É possível requerer judicialmente o desbloqueio da conta e a liberação imediata dos valores retidos, com base no CDC e na vedação ao enriquecimento sem causa. Tutelas de urgência têm sido concedidas com frequência nesses casos, especialmente quando há saldo significativo retido indevidamente."
      }
    ]
  },
  {
    category: "Gestão de Passivos e Prescrição",
    questions: [
      {
        question: "Uma dívida antiga pode ser cobrada para sempre?",
        answer: "Não. As dívidas possuem prazo prescricional previsto em lei. Dívidas cíveis geralmente prescrevem em 3 ou 5 anos; execuções fiscais em 5 anos. Após esse prazo, a cobrança judicial pode ser bloqueada por meio de defesa técnica adequada."
      },
      {
        question: "O que é prescrição intercorrente em execução fiscal?",
        answer: "É a extinção da execução fiscal pelo decurso de prazo quando o credor abandona o processo sem promover atos úteis por mais de 5 anos. O STJ e o STF já consolidaram esse entendimento, e ele pode ser aplicado para extinguir execuções fiscais antigas paralisadas."
      }
    ]
  },
  {
    category: "Contratos e Societário",
    questions: [
      {
        question: "Por que é importante revisar um contrato antes de assinar?",
        answer: "Contratos mal redigidos ou com cláusulas abusivas podem gerar prejuízos futuros difíceis de reverter. A revisão prévia por um advogado identifica riscos, desequilíbrios contratuais e cláusulas que podem ser renegociadas antes da assinatura, evitando litígios futuros."
      },
      {
        question: "O que é uma holding familiar e quais as vantagens?",
        answer: "Holding familiar é uma pessoa jurídica criada para concentrar e administrar o patrimônio da família. As principais vantagens são: economia tributária na transmissão de bens, maior facilidade no processo de sucessão, proteção patrimonial contra credores e planejamento societário eficiente."
      }
    ]
  },
  {
    category: "Auxílio-Acidente",
    questions: [
      {
        question: "O que é o auxílio-acidente e qual a diferença para o auxílio-doença?",
        answer: "O auxílio-acidente é um benefício indenizatório pago pelo INSS ao segurado que sofreu acidente ou doença ocupacional e ficou com sequelas permanentes que reduzem sua capacidade de trabalho. Diferente do auxílio-doença, que é temporário e substituí o salário, o auxílio-acidente tem caráter permanente e pode ser recebido junto com o salário."
      },
      {
        question: "É possível receber auxílio-acidente e continuar trabalhando?",
        answer: "Sim. Como o auxílio-acidente tem natureza indenizatória (e não substitutiva do salário), ele pode ser acumulado com a remuneração do trabalho. O segurado continua exercendo sua atividade profissional e recebe o benefício como compensação pela redução de sua capacidade laborativa."
      },
      {
        question: "Como converter auxílio-doença em auxílio-acidente?",
        answer: "A conversão ocorre quando o segurado recebe alta do INSS após período de auxílio-doença, mas permanece com sequelas que reduzem sua capacidade de trabalho. É necessário laudo médico comprovando as sequelas permanentes. Caso o INSS negue a conversão, é possível requerer judicialmente."
      },
      {
        question: "Posso receber retroativos do auxílio-acidente?",
        answer: "Sim. Se o benefício deveria ter sido concedido em data anterior, é possível pleitear judicialmente o pagamento das parcelas retroativas, respeitando o prazo prescricional de 5 anos. Os valores são corrigidos monetariamente e podem representar quantias significativas."
      },
      {
        question: "Doenças ocupacionais como LER/DORT dão direito ao auxílio-acidente?",
        answer: "Sim. A legislação equipara doenças ocupacionais a acidentes de trabalho. Condições como LER/DORT, perda auditiva induzida por ruído e problemas de coluna causados pelo trabalho podem dar direito ao auxílio-acidente, desde que comprovado o nexo causal e a redução da capacidade laborativa."
      }
    ]
  }
];

const FAQSection = () => {
  // Flatten all FAQs for schema
  const allFaqs = faqs.flatMap(category => 
    category.questions.map(q => ({
      question: q.question,
      answer: q.answer,
    }))
  );

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      {/* JSON-LD Schema for Google Rich Snippets */}
      <FAQSchema faqs={allFaqs} />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <SectionTitle className="text-center">Perguntas Frequentes</SectionTitle>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Esclarecimentos sobre as principais dúvidas jurídicas
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-lg font-semibold text-primary mb-4">
                {category.category}
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${categoryIndex}-${index}`}
                    className="bg-card border border-border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
          As informações acima têm caráter meramente informativo e não substituem a consulta jurídica individualizada. 
          Cada caso possui particularidades que devem ser analisadas por profissional habilitado.
        </p>
      </div>
    </section>
  );
};

export default FAQSection;
