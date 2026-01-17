import { ArrowRight, Calendar, Clock, User, MessageCircle, Download } from "lucide-react";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import { BlogArticle, CONTACT_INFO } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ArticleAudioPlayer } from "@/components/ArticleAudioPlayer";
import ebookGestanteCapa from '@/assets/ebook-gestante-capa.png';
interface ArticlePageProps {
  article: BlogArticle;
  onBack: () => void;
  onContact: () => void;
}

export const ArticlePage = ({ article, onBack, onContact }: ArticlePageProps) => {
  const handleWhatsAppContact = () => {
    const text = `Olá, Dr. João Victor. Li o artigo "${article.title}" e gostaria de tirar algumas dúvidas sobre meu caso.`;
    window.open(`https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="animate-fade-in min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.div 
        className="bg-primary py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <button 
            onClick={onBack} 
            className="flex items-center text-sm font-bold uppercase tracking-wider text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Voltar ao Blog
          </button>
        </div>
      </motion.div>

      {/* Hero Image */}
      <motion.div 
        className="relative h-64 md:h-96 -mt-4"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </motion.div>

      {/* Article Content */}
      <article className="container mx-auto px-4 -mt-20 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Category Badge */}
          <motion.span 
            className="inline-block px-4 py-2 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider rounded-full mb-6"
            variants={fadeInUp}
          >
            {article.category}
          </motion.span>

          {/* Title */}
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary font-heading mb-6 leading-tight"
            variants={fadeInUp}
          >
            {article.title}
          </motion.h1>

          {/* Meta Info */}
          <motion.div 
            className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-10 pb-10 border-b border-border"
            variants={fadeInUp}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {CONTACT_INFO.lawyerName}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {article.readTime} de leitura
            </span>
          </motion.div>

          {/* Audio Player */}
          <motion.div
            className="mb-10"
            variants={fadeInUp}
          >
            <ArticleAudioPlayer 
              articleContent={article.content || ''} 
              articleTitle={article.title} 
            />
          </motion.div>

          {/* Article Body - Sanitized to prevent XSS */}
          <motion.div 
            className="article-content prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || '') }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />

          {/* Download PDF Section - Only for HIV article */}
          {article.id === 'isencao-ir-hiv' && (
            <motion.div 
              className="mt-12 p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30 rounded-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-extrabold text-primary font-heading mb-3">
                  📘 E-book Gratuito
                </h3>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Baixe nosso guia completo sobre isenção de Imposto de Renda para portadores de HIV e entenda todos os seus direitos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <a href="/assets/ebook-isencao-ir-hiv.pdf" download="Ebook-Isencao-IR-HIV.pdf">
                      <Download className="w-5 h-5 mr-2" />
                      Baixar E-book em PDF
                    </a>
                  </Button>
                  <Button 
                    onClick={handleWhatsAppContact}
                    size="lg"
                    className="bg-whatsapp hover:bg-whatsapp/90 text-white"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Falar com Advogado
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Download PDF Section - Gestante article with banner */}
          {article.id === 'direitos-gestante-demitida' && (
            <motion.div 
              className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Banner com Capa do Ebook */}
                <div className="w-full lg:w-1/3 flex-shrink-0">
                  <img 
                    src={ebookGestanteCapa} 
                    alt="Ebook Estabilidade dos Direitos Trabalhistas das Gestantes"
                    className="w-full max-w-[250px] mx-auto rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
                  />
                </div>
                
                {/* Conteúdo e Botões */}
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-xl md:text-2xl font-extrabold text-primary font-heading mb-3">
                    📘 E-book Gratuito
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-lg">
                    Baixe nosso guia completo sobre a Estabilidade dos Direitos 
                    Trabalhistas das Gestantes e entenda todos os seus direitos.
                  </p>
                  <div className="flex justify-center lg:justify-start">
                    <Button 
                      asChild
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <a href="/assets/ebook-estabilidade-gestante.pdf" download="Ebook-Estabilidade-Gestante.pdf">
                        <Download className="w-5 h-5 mr-2" />
                        Baixar E-book em PDF
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA Box */}
          <motion.div 
            className="mt-16 p-8 md:p-12 bg-primary rounded-2xl text-center"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h3 className="text-2xl md:text-3xl font-extrabold text-primary-foreground font-heading mb-4">
              Este artigo se aplica ao seu caso?
            </h3>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Cada situação é única. Fale diretamente com nosso especialista para uma análise personalizada do seu direito.
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                onClick={handleWhatsAppContact}
                size="lg"
                className="bg-whatsapp hover:bg-whatsapp/90 text-white"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Tirar Dúvidas no WhatsApp
              </Button>
              <Button 
                onClick={onContact}
                variant="outline"
                size="lg"
                className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary"
              >
                Agendar Consulta
              </Button>
            </motion.div>
          </motion.div>

          {/* Author Box */}
          <motion.div 
            className="mt-12 p-6 bg-secondary rounded-xl flex flex-col md:flex-row items-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.img 
              src={CONTACT_INFO.lawyerPhoto} 
              alt={CONTACT_INFO.lawyerName}
              className="w-20 h-20 rounded-full object-cover"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Autor</p>
              <h4 className="font-bold text-primary font-heading">{CONTACT_INFO.lawyerName}</h4>
              <p className="text-sm text-muted-foreground">{CONTACT_INFO.oab} • Especialista em Direito Tributário e Trabalhista</p>
            </div>
          </motion.div>
        </motion.div>
      </article>
    </div>
  );
};
