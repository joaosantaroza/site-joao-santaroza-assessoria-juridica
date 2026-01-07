import { ArrowRight, Calendar, Clock, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { BLOG_ARTICLES, BlogArticle } from "@/lib/constants";

interface BlogSectionProps {
  onContact: () => void;
  onArticleClick: (articleId: string) => void;
}

const ArticleCard = ({ 
  article, 
  index, 
  onClick 
}: { 
  article: BlogArticle; 
  index: number;
  onClick: () => void;
}) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    onClick={onClick}
    className="group bg-card rounded-xl border border-border overflow-hidden hover:border-accent hover:shadow-xl transition-all duration-300 cursor-pointer"
  >
    {/* Article Image */}
    <div className="relative h-48 overflow-hidden">
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider rounded-full">
          {article.category}
        </span>
      </div>
    </div>

    {/* Article Content */}
    <div className="p-6">
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {article.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {article.readTime}
        </span>
      </div>

      <h3 className="text-lg font-bold text-primary font-heading mb-3 line-clamp-2 group-hover:text-accent transition-colors">
        {article.title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {article.excerpt}
      </p>

      <div className="flex items-center text-sm font-bold text-accent group-hover:gap-3 transition-all">
        Ler Artigo <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </div>
  </motion.article>
);

export const BlogSection = ({ onContact, onArticleClick }: BlogSectionProps) => (
  <section className="py-24 bg-secondary">
    <div className="container mx-auto px-4">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-6">
          <BookOpen className="w-4 h-4" />
          Conhecimento Jurídico
        </div>
        <SectionTitle className="text-center">
          Artigos e Orientações
        </SectionTitle>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Informação clara sobre seus direitos. Nosso compromisso é democratizar o conhecimento jurídico.
        </p>
      </motion.div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {BLOG_ARTICLES.map((article, index) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            index={index}
            onClick={() => onArticleClick(article.id)}
          />
        ))}
      </div>

      {/* CTA */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <p className="text-muted-foreground mb-4">
          Tem dúvidas sobre seu caso específico?
        </p>
        <button
          onClick={onContact}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wide rounded-lg hover:bg-accent transition-colors shadow-lg"
        >
          Fale com um Especialista
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  </section>
);
