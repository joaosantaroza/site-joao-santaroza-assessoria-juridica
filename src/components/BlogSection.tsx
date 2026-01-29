import { ArrowRight, Calendar, Clock, BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { BlogArticle } from "@/lib/constants";
import { useBlogArticles } from "@/hooks/useBlogArticles";

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
    whileHover={{ 
      y: -8,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    }}
    onClick={onClick}
    className="group bg-card rounded-xl border border-border overflow-hidden hover:border-accent hover:shadow-2xl transition-all duration-300 cursor-pointer"
  >
    {/* Article Image */}
    <div className="relative h-48 overflow-hidden">
      <motion.img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <motion.div 
        className="absolute top-4 left-4"
        whileHover={{ scale: 1.05 }}
      >
        <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
          {article.category}
        </span>
      </motion.div>
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

      <h3 className="text-lg font-bold text-primary font-heading mb-3 line-clamp-2 group-hover:text-accent transition-colors duration-300">
        {article.title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {article.excerpt}
      </p>

      <motion.div 
        className="flex items-center text-sm font-bold text-accent"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        Ler Artigo 
        <motion.span
          className="ml-2"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowRight className="w-4 h-4" />
        </motion.span>
      </motion.div>
    </div>
  </motion.article>
);

export const BlogSection = ({ onContact, onArticleClick }: BlogSectionProps) => {
  const { articles, loading } = useBlogArticles();
  
  // Show only first 6 articles on homepage
  const displayedArticles = articles.slice(0, 6);

  return (
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {/* Articles Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {displayedArticles.map((article, index) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                index={index}
                onClick={() => onArticleClick(article.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayedArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhum artigo disponível no momento.</p>
          </div>
        )}

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
            Agende um Atendimento
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
