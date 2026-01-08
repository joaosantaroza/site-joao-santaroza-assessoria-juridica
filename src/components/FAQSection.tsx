import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionTitle } from "./ui/SectionTitle";

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
  }
];

const FAQSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
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
