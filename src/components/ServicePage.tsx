import { ArrowRight, CheckCircle, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Service } from "@/lib/constants";
import { motion } from "framer-motion";
import { PracticeAreaArticles } from "@/components/PracticeAreaArticles";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PRACTICE_AREA_CATEGORIES, PRACTICE_AREA_ARTICLE_TITLES } from "@/lib/practiceAreaCategories";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { ArticleEbookBanner } from "@/components/ArticleEbookBanner";
import ebookAuxilioAcidenteCapa from "@/assets/ebook-auxilio-acidente-capa.png";
import ebookDesbloqueioMlCapa from "@/assets/ebook-desbloqueio-ml-capa.png";
import ebookReajustePlanoCapa from "@/assets/ebook-reajuste-plano-capa.png";
import ebookContratosCapa from "@/assets/ebook-contratos-capa.png";

const SERVICE_FAQS: Record<string, { question: string; answer: string }[]> = {
  recovery_mercadolivre: [
    {
      question: "Por que o Mercado Livre está suspendendo tantas contas em 2025-2026?",
      answer: "A partir de 2025, o Mercado Livre intensificou drasticamente a moderação algorítmica automatizada para combater fraudes. No entanto, esses algoritmos geram uma quantidade massiva de falsos positivos, atingindo lojistas legítimos com anos de histórico positivo. Suspensões ocorrem por cruzamento de dados de IP, desvios estatísticos mínimos ou associação indevida a contas banidas, sem análise humana prévia."
    },
    {
      question: "A retenção do meu saldo no Mercado Pago por até 180 dias é legal?",
      answer: "A retenção genérica e prolongada de valores sem ordem judicial e sem comprovação de fraude configura prática abusiva perante o Código de Defesa do Consumidor e pode caracterizar enriquecimento sem causa (Art. 884 do Código Civil). Os tribunais, especialmente o TJSP, têm concedido tutelas de urgência determinando a liberação imediata dos valores retidos, sob pena de multa diária (astreintes)."
    },
    {
      question: "Quais são os fundamentos jurídicos para o desbloqueio da conta?",
      answer: "A tese jurídica se apoia na eficácia horizontal dos direitos fundamentais (Art. 5º, LIV e LV da CF — devido processo legal e contraditório), no Marco Civil da Internet (Art. 7º — dever de transparência e motivação), no CDC (Arts. 6º e 39 — proteção contra práticas abusivas) e na responsabilidade civil objetiva (Art. 14 do CDC — falha na prestação do serviço). A plataforma não pode exercer poder de moderação de forma despótica e sem contraditório."
    },
    {
      question: "Posso receber indenização por lucros cessantes durante o período de bloqueio?",
      answer: "Sim. Os lucros cessantes representam o que o lojista razoavelmente deixou de faturar durante o bloqueio indevido. A apuração exige perícia contábil que analisa a média histórica de vendas, taxas de conversão, sazonalidade e margem de lucro líquido. Além disso, a jurisprudência reconhece danos morais pela afronta à imagem profissional, com indenizações que variam entre R$ 15.000 e R$ 25.000."
    },
    {
      question: "Qual o passo a passo para buscar o desbloqueio judicialmente?",
      answer: "O protocolo segue três fases: (1) Documentação preventiva — backup de extratos, prints de reputação, relatórios de vendas e comunicações da plataforma; (2) Esgotamento extrajudicial — registro no Consumidor.gov.br, Reclame Aqui e envio de Notificação Extrajudicial com prazo de 48-72 horas; (3) Ação judicial — com pedido de Tutela de Urgência (liminar) para restabelecimento imediato da conta e desbloqueio dos fundos, mediante comprovação do fumus boni iuris e periculum in mora."
    },
    {
      question: "O que acontece se o Mercado Livre não cumprir a liminar?",
      answer: "Caso a plataforma descumpra a ordem judicial de restabelecimento da conta ou liberação dos valores, o juiz pode impor multa diária (astreintes) com valores significativos até o cumprimento integral. O descumprimento reiterado pode ainda configurar crime de desobediência e ensejar responsabilização pessoal dos representantes legais da empresa."
    },
    {
      question: "O lojista pessoa jurídica pode usar o Código de Defesa do Consumidor?",
      answer: "Sim. A jurisprudência dominante, especialmente no TJSP, reconhece a incidência do CDC na relação entre plataforma e lojista, com base na teoria finalista mitigada. Isso ocorre pela vulnerabilidade tríplice do vendedor: técnica (desconhecimento dos critérios do algoritmo), informacional (ausência de dados sobre os motivos da suspensão) e econômica (dependência financeira do fluxo de caixa retido)."
    }
  ],
  auxilio_acidente: [
    {
      question: "O que é o auxílio-acidente e qual a diferença para o auxílio-doença?",
      answer: "O auxílio-acidente é um benefício indenizatório pago pelo INSS ao segurado que ficou com sequelas permanentes após acidente ou doença ocupacional. Diferente do auxílio-doença (temporário e substitutivo do salário), o auxílio-acidente é permanente e pode ser acumulado com o salário."
    },
    {
      question: "É possível receber auxílio-acidente e continuar trabalhando?",
      answer: "Sim. O auxílio-acidente tem natureza indenizatória, podendo ser acumulado com a remuneração do trabalho. O segurado continua trabalhando e recebe o benefício como compensação pela redução da capacidade laborativa."
    },
    {
      question: "Como funciona a conversão de auxílio-doença em auxílio-acidente?",
      answer: "A conversão ocorre quando o segurado recebe alta do INSS após auxílio-doença, mas permanece com sequelas que reduzem sua capacidade de trabalho. É necessário laudo médico comprovando as sequelas. Caso o INSS negue, é possível requerer judicialmente."
    },
    {
      question: "Posso receber valores retroativos do auxílio-acidente?",
      answer: "Sim. Se o benefício deveria ter sido concedido anteriormente, é possível pleitear judicialmente as parcelas retroativas dos últimos 5 anos, com correção monetária, o que pode representar valores significativos."
    },
    {
      question: "Doenças ocupacionais como LER/DORT dão direito ao auxílio-acidente?",
      answer: "Sim. A legislação equipara doenças ocupacionais a acidentes de trabalho. LER/DORT, perda auditiva e problemas de coluna causados pelo trabalho podem gerar direito ao auxílio-acidente, desde que comprovado o nexo causal e a redução da capacidade laborativa."
    }
  ],
  reajuste_plano_saude: [
    {
      question: "O que é um 'falso coletivo' e por que meu plano MEI/PME pode ser ilegal?",
      answer: "Planos vendidos como coletivos através de MEI, sindicatos ou associações de fachada, mas que na prática reúnem menos de 30 vidas sem negociação real entre as partes, são considerados 'falsos coletivos'. A jurisprudência dos tribunais estaduais (TJSP, TJRJ) tem equiparado esses contratos a planos individuais, submetendo-os ao teto de reajuste fixado pela ANS — muito inferior aos 15-45% aplicados pelas operadoras."
    },
    {
      question: "Meu plano coletivo pode ter reajuste limitado ao teto da ANS?",
      answer: "Sim, quando se tratar de falso coletivo. Se o contrato foi celebrado via adesão a uma entidade sem vínculo real (MEI de fachada, associação genérica) e sem negociação paritária, o Judiciário pode determinar a equiparação ao índice da ANS. Em 2025, o teto foi fixado em 6,06%, enquanto muitos planos coletivos tiveram reajustes de 20% a 45%."
    },
    {
      question: "A operadora pode cancelar meu plano por eu entrar com ação judicial?",
      answer: "Não. O Tema 1082 do STJ consolidou que a operadora não pode rescindir unilateralmente o contrato durante tratamento em curso ou em razão de litígio judicial. O cancelamento retaliativo é considerado prática abusiva pelo CDC e pode ensejar danos morais, além de tutela de urgência para manutenção do plano."
    },
    {
      question: "Como provar que o reajuste por sinistralidade é abusivo?",
      answer: "A operadora tem o dever de transparência: deve apresentar a composição atuarial completa que justifica o reajuste, incluindo o VCMH (Variação de Custos Médico-Hospitalares), a taxa de sinistralidade real e a margem de lucro. Se não o fizer, ocorre a inversão do ônus da prova (Art. 6º, VIII do CDC). A perícia atuarial judicial pode revelar que o índice aplicado não guarda correspondência com os custos reais."
    },
    {
      question: "O Estatuto do Idoso protege contra reajustes por faixa etária?",
      answer: "Sim. O Art. 15, §3º do Estatuto do Idoso veda a discriminação do idoso nos planos de saúde mediante cobranças diferenciadas em razão da idade. O Tema 952 do STJ reforça que reajustes por faixa etária aos 59 anos (a chamada 'manobra da penúltima faixa') são abusivos quando resultam em aumentos desproporcionais que inviabilizam a permanência no plano."
    },
    {
      question: "Posso recuperar valores pagos a mais nos últimos anos?",
      answer: "Sim. A ação judicial pode incluir pedido de restituição retroativa dos valores pagos a maior nos últimos 3 anos (prazo prescricional do CDC), com correção monetária e juros de mora. Em casos de reajustes abusivos acumulados, os valores podem ser expressivos."
    },
    {
      question: "A operadora pode cancelar meu plano durante um tratamento médico?",
      answer: "Não. O Tema 1082 do STJ e a jurisprudência consolidada proíbem o cancelamento unilateral durante tratamento em curso. Mesmo em planos coletivos, a rescisão exige notificação prévia de 60 dias e não pode ocorrer durante internação ou tratamento continuado. A tutela de urgência pode ser obtida em 24-72 horas para manter o plano ativo."
    }
  ],
  contracts: [
    {
      question: "Por que preciso de um contrato formal se já tenho um acordo verbal?",
      answer: "Acordos verbais são válidos no direito brasileiro, mas extremamente difíceis de provar em caso de litígio. Um contrato formal documenta obrigações, prazos, valores e penalidades, servindo como prova robusta perante o Judiciário. Além disso, cláusulas específicas como foro de eleição, limitação de responsabilidade e mecanismo de resolução de disputas só podem ser estipuladas por escrito."
    },
    {
      question: "Qual a diferença entre revisão e blindagem contratual?",
      answer: "A revisão contratual analisa o documento existente para identificar riscos, ambiguidades e cláusulas abusivas. Já a blindagem vai além: reestrutura o contrato com cláusulas protetivas (limitação de responsabilidade, multas escalonadas, gatilhos de rescisão, cláusula arbitral), antecipando cenários de conflito e criando mecanismos de defesa preventiva."
    },
    {
      question: "O que é um Acordo de Sócios e por que toda empresa deveria ter?",
      answer: "O Acordo de Sócios (ou Shareholders' Agreement) regula questões que o Contrato Social não aborda: direito de preferência na venda de cotas, cláusula de tag along/drag along, vesting de participação, não-concorrência, distribuição de lucros e mecanismo de resolução de impasses societários (deadlock). Sem esse instrumento, divergências entre sócios frequentemente resultam em dissolução litigiosa da empresa."
    },
    {
      question: "Contratos de prestação de serviços precisam de cláusula sobre LGPD?",
      answer: "Sim, obrigatoriamente. A Lei Geral de Proteção de Dados (Lei 13.709/2018) exige que contratos entre controladores e operadores de dados contenham cláusulas específicas sobre tratamento, armazenamento, compartilhamento e eliminação de dados pessoais. A ausência dessas cláusulas pode gerar multas de até 2% do faturamento, limitadas a R$ 50 milhões por infração."
    },
    {
      question: "Como funciona a cláusula de não-concorrência em contratos empresariais?",
      answer: "A cláusula de não-concorrência impede que uma parte exerça atividade concorrente durante e após o término do contrato. Para ser válida, deve ter limitação temporal razoável (geralmente 2 a 5 anos), escopo geográfico definido e, preferencialmente, compensação financeira correspondente. Cláusulas sem esses limites podem ser consideradas abusivas pelo Judiciário."
    },
    {
      question: "Qual o risco de usar modelos de contrato da internet?",
      answer: "Modelos genéricos não consideram as particularidades do seu negócio, do seu setor ou da legislação aplicável. Frequentemente contêm cláusulas conflitantes, terminologia inadequada ou omitem proteções essenciais. Em caso de litígio, um contrato mal redigido pode ser mais prejudicial do que a ausência de contrato, pois cria expectativas jurídicas que podem ser interpretadas contra você."
    },
    {
      question: "É possível rescindir um contrato antes do prazo sem pagar multa?",
      answer: "Depende das cláusulas contratuais e da conduta das partes. A rescisão antecipada pode ocorrer sem multa quando há descumprimento contratual pela outra parte (exceção do contrato não cumprido — Art. 476 do CC), onerosidade excessiva (Art. 478 do CC) ou caso fortuito/força maior. A notificação extrajudicial prévia é essencial para constituir a outra parte em mora e documentar os fundamentos da rescisão."
    }
  ]
};

interface ServicePageProps {
  service: Service;
  onBack: () => void;
  onContact: () => void;
}

export const ServicePage = ({ service, onBack, onContact }: ServicePageProps) => {
  const Icon = service.icon;
  const isHIV = service.id === 'hiv';

  return (
    <div className="animate-fade-in pb-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={onBack} 
          className="flex items-center text-sm font-bold uppercase tracking-wider group transition-colors text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Voltar
        </button>
      </div>

      <section className="container mx-auto px-4 py-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {isHIV && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-8">
              <Lock className="w-3 h-3" /> Sigilo Absoluto Garantido
            </div>
          )}

          <div className="inline-flex p-5 rounded-2xl mb-8 shadow-lg bg-primary">
            <Icon className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-6 text-primary font-heading">
            {service.heroTitle}
          </h1>
          <p className="text-xl leading-relaxed mb-10 max-w-2xl mx-auto text-muted-foreground">
            {service.heroSubtitle}
          </p>

          <div className="bg-card border-l-4 border-accent p-6 mb-10 text-left max-w-2xl mx-auto shadow-md rounded-r-lg">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 flex-shrink-0 mt-1 text-primary" />
              <div className="text-sm text-muted-foreground leading-relaxed">
                {isHIV ? (
                  <><strong className="text-foreground">Privacidade Total:</strong> Conforme a Lei 14.289/2022, seu processo poderá tramitar em Segredo de Justiça, preservando seu diagnóstico.</>
                ) : (
                  <><strong className="text-foreground">Análise Técnica:</strong> Cada caso exige análise individualizada. Nossa orientação é baseada em estudo documental para definição da estratégia adequada.</>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={onContact} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isHIV ? "Atendimento Sigiloso" : "Agende um Atendimento"}
            </Button>
            <Button onClick={onContact} variant="outline" size="lg">
              Tire suas Dúvidas
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {service.features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              className="bg-card p-8 rounded-xl border border-border flex flex-col items-center text-center hover:border-accent transition-all shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * idx }}
            >
              <CheckCircle className="w-8 h-8 mb-4 text-accent" />
              <span className="font-bold text-foreground">{feature}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* E-book Banner for Auxílio-Acidente */}
        {service.id === 'auxilio_acidente' && (
          <div className="max-w-4xl mx-auto">
            <ArticleEbookBanner
              ebookId="auxilio-acidente"
              ebookTitle="Guia Completo do Auxílio-Acidente"
              ebookSubtitle="Descubra seus direitos, requisitos e como garantir o benefício do INSS. Guia gratuito com 7 capítulos completos."
              ebookCoverUrl={ebookAuxilioAcidenteCapa}
              ebookPdfUrl=""
            />
          </div>
        )}

        {/* E-book Banner for Desbloqueio Mercado Livre */}
        {service.id === 'recovery_mercadolivre' && (
          <div className="max-w-4xl mx-auto">
            <ArticleEbookBanner
              ebookId="desbloqueio-mercado-livre"
              ebookTitle="Guia Completo: Desbloqueio de Contas no Mercado Livre"
              ebookSubtitle="Seus direitos contra suspensões algorítmicas, retenção de saldo e como buscar indenização. Guia gratuito com 7 capítulos."
              ebookCoverUrl={ebookDesbloqueioMlCapa}
              ebookPdfUrl=""
            />
          </div>
        )}

        {/* E-book Banner for Reajuste Plano de Saúde */}
        {service.id === 'reajuste_plano_saude' && (
          <div className="max-w-4xl mx-auto">
            <ArticleEbookBanner
              ebookId="reajuste-plano-saude"
              ebookTitle="Guia Completo: Reajuste Abusivo em Planos de Saúde"
              ebookSubtitle="Identifique reajustes ilegais, conheça a tese do falso coletivo e saiba como recuperar valores pagos a mais. Guia gratuito com 7 capítulos."
              ebookCoverUrl={ebookReajustePlanoCapa}
              ebookPdfUrl=""
            />
          </div>
        )}

        {/* Service-specific FAQ */}
        {SERVICE_FAQS[service.id] && (
          <div className="max-w-4xl mx-auto mt-16">
            <FAQSchema faqs={SERVICE_FAQS[service.id]} />
            <SectionTitle className="text-center mb-8">Perguntas Frequentes</SectionTitle>
            <Accordion type="single" collapsible className="space-y-2">
              {SERVICE_FAQS[service.id].map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
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
        )}

        {/* Testimonials Section */}
        <div className="max-w-6xl mx-auto mt-16">
          <TestimonialsSection
            areaId={service.id}
            title="Depoimentos de Clientes"
            maxItems={3}
          />
        </div>

        {/* Related Articles Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <PracticeAreaArticles
            categories={PRACTICE_AREA_CATEGORIES[service.id] || []}
            title={PRACTICE_AREA_ARTICLE_TITLES[service.id] || 'Artigos Relacionados'}
            maxArticles={3}
          />
        </div>
      </section>
    </div>
  );
};
