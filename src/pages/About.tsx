import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactModal } from "@/components/ContactModal";
import { BreadcrumbsJsonLd } from "@/components/BreadcrumbsJsonLd";
import { useSEO } from "@/hooks/useSEO";
import { CONTACT_INFO, ViewType } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Scale,
  Eye,
  Target,
  Lock,
  Heart,
  ChevronRight,
  Award,
  Briefcase,
  BookOpen,
} from "lucide-react";
import lawyerPhoto from "@/assets/lawyer-photo.jpg";

// ── Data ──────────────────────────────────────────────

const TIMELINE = [
  { year: "2008", title: "Início da Graduação em Direito", desc: "Ingresso no curso de Direito pela Universidade Paranaense (UNIPAR)." },
  { year: "2013", title: "Conclusão do Bacharelado", desc: "Formação em Direito pela UNIPAR com foco em áreas cível e tributária." },
  { year: "2016", title: "Início da Atuação como Advogado", desc: "Início da carreira advocatícia em Tapejara, Paraná, com atuação em tempo integral." },
  { year: "2017", title: "Inscrição na OAB/PR", desc: "Aprovação no Exame de Ordem e inscrição sob o nº 81.381." },
  { year: "2021", title: "Certificação em Negociação", desc: "Conclusão do curso Negotiation Mastery pela Dale Carnegie Training." },
  { year: "2022", title: "Certificação em Apresentações", desc: "Conclusão do curso High Impact Presentations pela Dale Carnegie Training." },
  { year: "2022", title: "Fundação do Escritório Digital", desc: "Criação da João Santaroza Assessoria Jurídica com atuação digital em todo o Brasil." },
  { year: "2024", title: "Referência em Isenção de IR", desc: "Reconhecimento como referência em isenção fiscal para portadores de doenças graves." },
];

const EDUCATION = [
  { title: "Bacharelado em Direito", institution: "Universidade Paranaense (UNIPAR)", year: "2008 – 2013", icon: GraduationCap },
  { title: "Pós-graduação em Direito Tributário", institution: "Damásio Educacional", year: "Especialização", icon: BookOpen },
  { title: "High Impact Presentations", institution: "Dale Carnegie Training", year: "2022", icon: Award },
  { title: "Negotiation Mastery", institution: "Dale Carnegie Training", year: "2021", icon: Briefcase },
];

const VALUES = [
  { title: "Ética", desc: "Conduta pautada pelos princípios da advocacia e pelo Código de Ética da OAB.", icon: Scale },
  { title: "Transparência", desc: "Comunicação clara sobre prazos, custos e expectativas em cada etapa do processo.", icon: Eye },
  { title: "Resultado", desc: "Foco em soluções eficientes e no melhor resultado possível para cada cliente.", icon: Target },
  { title: "Sigilo", desc: "Garantia de confidencialidade total sobre dados e informações do cliente.", icon: Lock },
  { title: "Humanização", desc: "Atendimento próximo, empático e personalizado para cada situação.", icon: Heart },
];

// ── Component ─────────────────────────────────────────

export default function About() {
  const [showContact, setShowContact] = useState(false);

  useSEO({
    title: "Sobre o Advogado | Dr. João Victor Santaroza",
    description:
      "Conheça o Dr. João Victor Santaroza – advogado inscrito na OAB/PR 81.381, especialista em Isenção de IR, Direito Trabalhista e Desbloqueio de Contas. Formação acadêmica, trajetória e valores.",
    url: "/sobre",
    type: "profile",
    keywords: [
      "advogado Maringá",
      "OAB PR 81381",
      "João Santaroza advogado",
      "especialista isenção imposto de renda",
      "direito tributário Paraná",
    ],
  });

  const handleNavigate = (view: ViewType) => {
    window.location.href = "/";
  };

  const breadcrumbItems = [
    { name: "Início", path: "/" },
    { name: "Sobre o Advogado", path: "/sobre" },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={handleNavigate} onContact={() => setShowContact(true)} />
      <BreadcrumbsJsonLd items={breadcrumbItems} />

      {/* Person JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: CONTACT_INFO.lawyerName,
            jobTitle: "Advogado",
            url: "https://joaosantarozaadvocacia.com.br/sobre",
            image: "https://joaosantarozaadvocacia.com.br/assets/lawyer-photo.jpg",
            telephone: CONTACT_INFO.phone,
            email: CONTACT_INFO.email,
            address: {
              "@type": "PostalAddress",
              addressRegion: "PR",
              addressCountry: "BR",
            },
            identifier: {
              "@type": "PropertyValue",
              name: "OAB",
              value: "PR 81.381",
            },
            knowsAbout: [
              "Isenção de Imposto de Renda",
              "Direito Tributário",
              "Direito do Trabalho",
              "Desbloqueio de Contas",
              "Contratos Empresariais",
            ],
            memberOf: {
              "@type": "Organization",
              name: "Ordem dos Advogados do Brasil - Seccional Paraná",
            },
            sameAs: [
              `https://instagram.com/${CONTACT_INFO.instagram.replace("@", "")}`,
            ],
          }),
        }}
      />

      {/* Breadcrumbs UI */}
      <nav className="container mx-auto px-4 pt-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link to="/" className="hover:text-primary transition-colors">Início</Link></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li><span className="text-foreground font-medium" aria-current="page">Sobre o Advogado</span></li>
        </ol>
      </nav>

      {/* ── Hero ── */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="order-2 lg:order-1"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent mb-3">
              {CONTACT_INFO.oab}
            </p>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-primary font-heading mb-4">
              {CONTACT_INFO.lawyerName}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Advogado atuante desde 2016, com mais de 9 anos de experiência em planejamento tributário, gestão de contratos e defesa de direitos. Especialista em Isenção de Imposto de Renda para portadores de doenças graves e Desbloqueio de Contas Judiciais, com atuação digital em todo o Brasil a partir de Tapejara, Paraná.
            </p>
            <Button onClick={() => setShowContact(true)} size="lg">
              Agendar Consulta
            </Button>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="order-1 lg:order-2 flex justify-center"
          >
            <img
              src={lawyerPhoto}
              alt={`Foto profissional de ${CONTACT_INFO.lawyerName}, advogado inscrito na ${CONTACT_INFO.oab}`}
              className="w-72 h-72 lg:w-96 lg:h-96 rounded-2xl object-cover shadow-xl border-4 border-accent/20"
              loading="eager"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Bio ── */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-6 text-primary font-heading">
              Minha Trajetória
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-justify">
              <p>
                Formado em Direito pela Universidade Paranaense (UNIPAR) e pós-graduado em Direito Tributário pelo Damásio Educacional, atuo como advogado desde abril de 2016. Ao longo de mais de 9 anos de carreira, construí uma trajetória focada em planejamento tributário e gestão de contratos, sempre com o propósito de utilizar o Direito como instrumento de transformação na vida das pessoas.
              </p>
              <p>
                Especializei-me em áreas que impactam diretamente o patrimônio e a qualidade de vida dos meus clientes: a isenção de imposto de renda para portadores de doenças graves, o desbloqueio de contas judiciais e a assessoria contratual e societária. Busquei também formação complementar em negociação e comunicação de alto impacto pela Dale Carnegie Training, o que me permite conduzir cada caso com estratégia e clareza.
              </p>
              <p>
                Minha filosofia de trabalho é baseada em três pilares: <strong className="text-foreground">diagnóstico preciso</strong> da situação jurídica, <strong className="text-foreground">comunicação clara</strong> em cada etapa do processo e <strong className="text-foreground">busca incansável</strong> pelo melhor resultado possível. Acredito que o acesso à justiça deve ser simples, transparente e humanizado — valores que aplico em cada atendimento, seja presencial ou digital.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="container mx-auto px-4 py-16 lg:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-12 text-primary font-heading text-center">
            Linha do Tempo
          </h2>
        </motion.div>

        <div className="relative max-w-2xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-5 lg:left-1/2 top-0 bottom-0 w-0.5 bg-accent/30 -translate-x-1/2" />

          {TIMELINE.map((item, i) => (
            <motion.div
              key={item.year}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className={`relative flex items-start gap-6 mb-10 ${
                i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              {/* Marker */}
              <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-md lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                <Award className="w-4 h-4 text-accent-foreground" />
              </div>

              {/* Card */}
              <div
                className={`flex-1 bg-card rounded-xl p-5 shadow-sm border border-border ${
                  i % 2 === 0 ? "lg:mr-[55%]" : "lg:ml-[55%]"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-accent">{item.year}</span>
                <h3 className="font-bold text-foreground mt-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Education ── */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-10 text-primary font-heading text-center">
              Formação Acadêmica
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {EDUCATION.map((edu, i) => {
              const Icon = edu.icon;
              return (
                <motion.div
                  key={edu.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="bg-card rounded-xl p-6 border border-border shadow-sm text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{edu.title}</h3>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <p className="text-xs text-accent font-semibold mt-2">{edu.year}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="container mx-auto px-4 py-16 lg:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-10 text-primary font-heading text-center">
            Valores do Escritório
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {VALUES.map((val, i) => {
            const Icon = val.icon;
            return (
              <motion.div
                key={val.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="text-center p-5"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{val.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 text-primary-foreground font-heading">
              Precisa de Orientação Jurídica?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Agende uma consulta e tenha um diagnóstico preciso da sua situação. Atendimento digital em todo o Brasil.
            </p>
            <Button
              onClick={() => setShowContact(true)}
              variant="secondary"
              size="lg"
              className="font-bold"
            >
              Falar com o Advogado
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}
