import { Scale, ArrowRight, Layers, MessageCircle, Mail, Instagram, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_INFO, ViewType } from "@/lib/constants";
import { motion } from "framer-motion";
import { BlogSection } from "@/components/BlogSection";
import FAQSection from "@/components/FAQSection";
import { SEOSection } from "@/components/SEOSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { useNavigate } from "react-router-dom";
import { LocalBusinessSchema, WebsiteSchema } from "@/components/seo";

interface HomePageProps {
  onNavigate: (view: ViewType) => void;
  onContact: () => void;
}

export const HomePage = ({ onNavigate, onContact }: HomePageProps) => {
  const navigate = useNavigate();
  
  return (
  <>
    {/* Schema.org JSON-LD for Rich Snippets */}
    <LocalBusinessSchema />
    <WebsiteSchema />
    
    {/* Hero Section */}
    <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-48 overflow-hidden bg-primary">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={CONTACT_INFO.heroImage} 
          alt="Office" 
          className="w-full h-full object-cover opacity-20" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-8">
            <Scale className="w-4 h-4" />
            {CONTACT_INFO.firmSub}
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-primary-foreground mb-8 leading-tight font-heading">
            Assessoria Jurídica Especializada em{" "}
            <span className="text-accent">Direito Tributário, Empresarial e Digital.</span>
          </h1>
          
          <p className="text-xl text-primary-foreground/70 mb-12 leading-relaxed max-w-3xl font-light">
            Atuação técnica em isenção de imposto de renda para portadores de moléstias graves, desbloqueio de contas judiciais, direito do trabalho, recuperação de contas digitais hackeadas e reestruturação de passivos. Atendimento personalizado com foco em resultados.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5">
            <Button 
              onClick={() => navigate('/especialidades')} 
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Layers className="mr-2 w-5 h-5" />
              Ver Soluções
            </Button>
            <Button 
              onClick={onContact} 
              variant="outline"
              size="lg"
              className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary"
            >
              Agende um Atendimento
            </Button>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Gateway Card */}
    <section className="container mx-auto px-4 -mt-20 pb-24 relative z-20">
      <motion.div 
        className="grid grid-cols-1 gap-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div 
          onClick={() => navigate('/especialidades')} 
          className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 rounded-2xl cursor-pointer shadow-2xl transition-all transform hover:-translate-y-1 bg-card border-l-8 border-accent"
        >
          <div className="flex items-center gap-8 mb-6 md:mb-0">
            <div className="p-5 rounded-2xl bg-secondary">
              <Layers className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-primary font-heading">
                Nossas Especialidades
              </h3>
              <p className="text-muted-foreground text-sm">
                Isenção de IR • Desbloqueio de Contas • Trabalho • Recuperação Digital
              </p>
            </div>
          </div>
          
          <div className="flex items-center text-sm font-bold uppercase tracking-wide px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-colors">
            Acessar <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>
        {/* Articles Gateway Card */}
        <div 
          onClick={() => navigate('/blog')}
          className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 rounded-2xl cursor-pointer shadow-2xl transition-all transform hover:-translate-y-1 bg-card border-l-8 border-primary"
        >
          <div className="flex items-center gap-8 mb-6 md:mb-0">
            <div className="p-5 rounded-2xl bg-secondary">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-primary font-heading">
                Artigos e Informativos
              </h3>
              <p className="text-muted-foreground text-sm">
                Isenção de IR • Direitos do Trabalhador • Orientações Jurídicas
              </p>
            </div>
          </div>
          
          <div className="flex items-center text-sm font-bold uppercase tracking-wide px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-colors">
            Ler Artigos <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>
      </motion.div>
    </section>

    {/* About Section */}
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Bronze Frame */}
            <div className="absolute inset-0 border-2 border-accent translate-x-4 translate-y-4 rounded-xl" />
            <img 
              src={CONTACT_INFO.lawyerPhoto} 
              alt="Dr. João" 
              className="relative w-full max-w-md mx-auto rounded-xl shadow-2xl transition-all duration-700 z-10" 
            />
          </motion.div>
          <motion.div 
            className="lg:w-1/2 space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-foreground font-heading">
              Transparência, Honestidade e Diligência.
            </h2>
            <div className="space-y-6 text-primary-foreground/70 text-lg leading-relaxed font-light">
              <p>
                Fundamos o escritório <strong className="text-primary-foreground">João Santaroza Assessoria Jurídica</strong> para ser a resposta rápida que o empresário moderno precisa.
              </p>
              <p>
                Atuamos com diligência técnica para eliminar dívidas, desbloquear capital e blindar contratos. Sem promessas vazias, sem palavras difíceis: apenas estratégia jurídica eficaz para proteger o seu patrimônio e a sua paz.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="px-6 py-3 border border-accent rounded text-accent font-bold text-sm uppercase tracking-widest">
                {CONTACT_INFO.oab}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* SEO Section with Keywords */}
    <SEOSection />

    {/* Blog Section */}
    <BlogSection onContact={onContact} />

    {/* Testimonials Section */}
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <TestimonialsSection maxItems={6} />
      </div>
    </section>

    {/* FAQ Section */}
    <FAQSection />

    {/* Contact Section */}
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="bg-card rounded-2xl shadow-xl border border-border flex flex-col lg:flex-row overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="lg:w-1/2 p-12 flex flex-col justify-center">
            <h3 className="text-3xl font-extrabold mb-4 text-primary font-heading">
              Entre em Contato
            </h3>
            <p className="text-muted-foreground mb-10">
              Atendimento mediante agendamento para análise individualizada do seu caso.
            </p>
            
            <div className="space-y-6">
              <button 
                onClick={() => {
                  const text = `Olá, Dr. João Victor! Vi seu site e gostaria de uma orientação jurídica. Pode me ajudar?`;
                  window.open(`https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                }} 
                className="w-full flex items-center gap-5 p-5 rounded-xl bg-secondary hover:bg-card border border-transparent hover:border-accent transition-all group text-left"
              >
                <div className="w-12 h-12 bg-whatsapp text-white rounded-full flex items-center justify-center shadow-md">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                    WhatsApp (Prioritário)
                  </p>
                  <p className="text-xl font-bold text-primary">{CONTACT_INFO.whatsapp}</p>
                </div>
              </button>

              <a 
                href={`https://instagram.com/${CONTACT_INFO.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-5 p-5 rounded-xl bg-secondary hover:bg-card border border-transparent hover:border-accent transition-all group text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white rounded-full flex items-center justify-center shadow-md">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                    Instagram
                  </p>
                  <p className="text-xl font-bold text-primary">{CONTACT_INFO.instagram}</p>
                </div>
              </a>

              <div className="flex items-center gap-5 p-5">
                <div className="w-12 h-12 bg-card border border-border text-muted-foreground rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">E-mail</p>
                  <p className="text-lg font-medium text-foreground truncate">{CONTACT_INFO.email}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 min-h-[400px] bg-muted relative">
            <iframe 
              src={CONTACT_INFO.mapUrl} 
              width="100%" 
              height="100%" 
              style={{border: 0, filter: 'grayscale(100%)'}} 
              allowFullScreen 
              loading="lazy" 
              title="Mapa" 
              className="absolute inset-0 w-full h-full opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
};
