import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Tag, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import { BlogArticle } from "@/lib/constants";

const ARTICLES_PER_PAGE = 6;

interface BlogPageProps {
  onBack: () => void;
  onArticleClick: (articleId: string) => void;
}

const ArticleCard = ({ 
  article, 
  onClick,
  index
}: { 
  article: BlogArticle; 
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

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) => {
  const pages = useMemo(() => {
    const items: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) items.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) items.push(i);
      
      if (currentPage < totalPages - 2) items.push('...');
      items.push(totalPages);
    }
    
    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-10 w-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      {pages.map((page, idx) => (
        typeof page === 'number' ? (
          <Button
            key={idx}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            className="h-10 w-10"
          >
            {page}
          </Button>
        ) : (
          <span key={idx} className="px-2 text-muted-foreground">...</span>
        )
      ))}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-10 w-10"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const BlogPage = ({ onBack, onArticleClick }: BlogPageProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { articles, categories, loading } = useBlogArticles();

  const filteredArticles = useMemo(() => {
    return selectedCategory 
      ? articles.filter(a => a.category === selectedCategory)
      : articles;
  }, [selectedCategory, articles]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ARTICLES_PER_PAGE;
    return filteredArticles.slice(start, start + ARTICLES_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(prev => prev === category ? null : category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <button
              onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Todos
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                !selectedCategory ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/20 text-primary'
              }`}>
                {articles.length}
              </span>
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                {category}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedCategory === category ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/20 text-primary'
                }`}>
                  {articles.filter(a => a.category === category).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <SectionTitle>
              {selectedCategory ? `Artigos sobre ${selectedCategory}` : 'Todos os Artigos'}
            </SectionTitle>
            <p className="text-muted-foreground">
              {loading ? 'Carregando...' : (
                <>
                  {filteredArticles.length} artigo{filteredArticles.length !== 1 ? 's' : ''} disponíve{filteredArticles.length !== 1 ? 'is' : 'l'}
                  {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
                </>
              )}
            </p>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          )}

          {/* Articles */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => onArticleClick(article.id)}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && paginatedArticles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
            </div>
          )}

          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
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
