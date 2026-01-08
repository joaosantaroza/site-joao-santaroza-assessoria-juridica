import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLOG_ARTICLES } from "@/lib/constants";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface BlogPageProps {
  onBack: () => void;
  onArticleClick: (articleId: string) => void;
}

const ArticleCard = ({ 
  article, 
  onClick,
  index
}: { 
  article: typeof BLOG_ARTICLES[0]; 
  onClick: () => void;
  index: number;
}) => (
  <motion.article
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    onClick={onClick}
    className="group cursor-pointer bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border hover:border-primary/30"
  >
    <div className="relative h-56 overflow-hidden">
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      <span className="absolute bottom-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
        {article.category}
      </span>
    </div>
    
    <div className="p-6">
      <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2 font-heading">
        {article.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
        {article.excerpt}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {article.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
        </div>
      </div>
    </div>
  </motion.article>
);

export const BlogPage = ({ onBack, onArticleClick }: BlogPageProps) => {
  // Group articles by category
  const categories = [...new Set(BLOG_ARTICLES.map(a => a.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container mx-auto px-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground font-heading">
              Artigos e Informativos
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Conteúdo informativo sobre isenção de imposto de renda, direitos trabalhistas 
              e previdenciários. Material de caráter educativo e orientativo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 border-b border-border bg-card/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <span
                key={category}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
              >
                <Tag className="w-3.5 h-3.5" />
                {category}
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
                  {BLOG_ARTICLES.filter(a => a.category === category).length}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {categories.map((category) => (
            <div key={category} className="mb-16 last:mb-0">
              <div className="mb-8">
                <span className="text-sm font-bold uppercase tracking-wider text-primary mb-2 block">
                  {category}
                </span>
                <SectionTitle>Artigos sobre {category}</SectionTitle>
                <p className="text-muted-foreground">
                  {BLOG_ARTICLES.filter(a => a.category === category).length} artigos disponíveis
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {BLOG_ARTICLES
                  .filter(article => article.category === category)
                  .map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onClick={() => onArticleClick(article.id)}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-6">
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto">
            <strong>Aviso:</strong> O conteúdo deste blog possui caráter meramente informativo e educacional, 
            não constituindo aconselhamento jurídico específico. Para análise do seu caso concreto, 
            consulte um advogado.
          </p>
        </div>
      </section>
    </div>
  );
};
