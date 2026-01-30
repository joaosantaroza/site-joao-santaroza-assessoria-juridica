import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogArticle } from "@/lib/constants";

interface RelatedArticlesProps {
  currentArticle: BlogArticle;
  allArticles: BlogArticle[];
  onArticleClick?: (articleId: string) => void;
  maxArticles?: number;
}

export const RelatedArticles = ({
  currentArticle,
  allArticles,
  onArticleClick,
  maxArticles = 3,
}: RelatedArticlesProps) => {
  const relatedArticles = useMemo(() => {
    // Filter out current article
    const otherArticles = allArticles.filter((a) => a.id !== currentArticle.id);

    // Score articles based on shared categories
    const scoredArticles = otherArticles.map((article) => {
      const sharedCategories = article.categories.filter((cat) =>
        currentArticle.categories.includes(cat)
      );
      return {
        article,
        score: sharedCategories.length,
      };
    });

    // Sort by score (most shared categories first), then filter to only those with at least 1 match
    const withMatches = scoredArticles
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxArticles)
      .map((item) => item.article);

    // If we don't have enough matches, fill with other articles
    if (withMatches.length < maxArticles) {
      const remaining = otherArticles
        .filter((a) => !withMatches.some((m) => m.id === a.id))
        .slice(0, maxArticles - withMatches.length);
      return [...withMatches, ...remaining];
    }

    return withMatches;
  }, [currentArticle, allArticles, maxArticles]);

  if (relatedArticles.length === 0) {
    return null;
  }

  const handleClick = (articleId: string) => {
    if (onArticleClick) {
      onArticleClick(articleId);
    }
  };

  return (
    <motion.section
      className="mt-16 pt-12 border-t border-border"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl md:text-3xl font-extrabold text-primary font-heading mb-8">
        Artigos Relacionados
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedArticles.map((article, index) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30"
          >
            {onArticleClick ? (
              <div
                onClick={() => handleClick(article.id)}
                className="cursor-pointer"
              >
                <ArticleCardContent article={article} />
              </div>
            ) : (
              <Link to={`/blog/${article.id}`}>
                <ArticleCardContent article={article} />
              </Link>
            )}
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
};

const ArticleCardContent = ({ article }: { article: BlogArticle }) => (
  <>
    <div className="relative h-40 overflow-hidden">
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
        {article.categories.slice(0, 1).map((cat) => (
          <Badge
            key={cat}
            className="bg-primary text-primary-foreground text-[10px] font-bold"
          >
            {cat}
          </Badge>
        ))}
        {article.categories.length > 1 && (
          <Badge variant="secondary" className="text-[10px]">
            +{article.categories.length - 1}
          </Badge>
        )}
      </div>
    </div>

    <div className="p-4">
      <h3 className="text-base font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2 font-heading">
        {article.title}
      </h3>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {article.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readTime}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  </>
);
