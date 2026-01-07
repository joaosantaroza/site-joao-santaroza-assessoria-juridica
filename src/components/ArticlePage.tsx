import { ArrowRight, Calendar, Clock, User, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BlogArticle, CONTACT_INFO } from "@/lib/constants";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="animate-fade-in min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <button 
            onClick={onBack} 
            className="flex items-center text-sm font-bold uppercase tracking-wider text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Voltar ao Blog
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 md:h-96 -mt-4">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 -mt-20 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Category Badge */}
          <span className="inline-block px-4 py-2 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            {article.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary font-heading mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-10 pb-10 border-b border-border">
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
          </div>

          {/* Article Body */}
          <div 
            className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-primary prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
          />

          {/* CTA Box */}
          <motion.div 
            className="mt-16 p-8 md:p-12 bg-primary rounded-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl md:text-3xl font-extrabold text-primary-foreground font-heading mb-4">
              Este artigo se aplica ao seu caso?
            </h3>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Cada situação é única. Fale diretamente com nosso especialista para uma análise personalizada do seu direito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            </div>
          </motion.div>

          {/* Author Box */}
          <div className="mt-12 p-6 bg-secondary rounded-xl flex flex-col md:flex-row items-center gap-6">
            <img 
              src={CONTACT_INFO.lawyerPhoto} 
              alt={CONTACT_INFO.lawyerName}
              className="w-20 h-20 rounded-full object-cover grayscale"
            />
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Autor</p>
              <h4 className="font-bold text-primary font-heading">{CONTACT_INFO.lawyerName}</h4>
              <p className="text-sm text-muted-foreground">{CONTACT_INFO.oab} • Especialista em Direito Tributário e Trabalhista</p>
            </div>
          </div>
        </motion.div>
      </article>
    </div>
  );
};
