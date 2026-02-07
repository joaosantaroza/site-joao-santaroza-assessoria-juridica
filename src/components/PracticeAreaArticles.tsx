import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import { motion } from "framer-motion";

interface PracticeAreaArticlesProps {
  /** Categories to filter articles by (matches any) */
  categories: string[];
  /** Title for the section */
  title?: string;
  /** Maximum number of articles to show */
  maxArticles?: number;
}

/**
 * Displays a list of related blog articles for a practice area.
 * Filters articles by matching categories and shows most recent first.
 */
export const PracticeAreaArticles = ({
  categories,
  title = "Artigos sobre o Tema",
  maxArticles = 3,
}: PracticeAreaArticlesProps) => {
  const { articles, loading } = useBlogArticles();

  // Filter articles that match any of the specified categories
  const relatedArticles = articles
    .filter((article) =>
      article.categories.some((cat) =>
        categories.some((targetCat) =>
          cat.toLowerCase().includes(targetCat.toLowerCase()) ||
          targetCat.toLowerCase().includes(cat.toLowerCase())
        )
      )
    )
    .slice(0, maxArticles);

  if (loading || relatedArticles.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-primary font-heading">{title}</h3>
      </div>

      <div className="grid gap-4">
        {relatedArticles.map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <Link
              to={`/blog/${article.id}`}
              className="group flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent transition-all shadow-sm hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{article.readTime} de leitura</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 flex items-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* View all link */}
      <div className="mt-6 text-center">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors"
        >
          Ver todos os artigos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
