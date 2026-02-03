import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { BlogArticle } from '@/lib/constants';
import { getClustersByCategories, ContentCluster } from '@/lib/contentClusters';

interface InternalLinksProps {
  currentArticle: BlogArticle;
  allArticles: BlogArticle[];
  maxLinks?: number;
}

/**
 * Displays internal links to related articles within the same content cluster.
 * This improves SEO by creating strong topical connections between related content.
 */
export const InternalLinks = ({
  currentArticle,
  allArticles,
  maxLinks = 5,
}: InternalLinksProps) => {
  const { clusterArticles, clusters } = useMemo(() => {
    // Get clusters for current article's categories
    const articleClusters = getClustersByCategories(currentArticle.categories);
    
    if (articleClusters.length === 0) {
      return { clusterArticles: [], clusters: [] };
    }

    // Find other articles in the same clusters
    const relatedArticles = allArticles
      .filter(article => {
        if (article.id === currentArticle.id) return false;
        
        const articleCategories = article.categories;
        return articleClusters.some(cluster =>
          cluster.categories.some(clusterCat =>
            articleCategories.some(cat => 
              cat.toLowerCase() === clusterCat.toLowerCase()
            )
          )
        );
      })
      .slice(0, maxLinks);

    return {
      clusterArticles: relatedArticles,
      clusters: articleClusters,
    };
  }, [currentArticle, allArticles, maxLinks]);

  if (clusterArticles.length === 0) {
    return null;
  }

  const primaryCluster = clusters[0];

  return (
    <motion.aside
      className="my-12 p-6 bg-muted/50 rounded-xl border border-border"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg text-primary">
          Leia também sobre {primaryCluster?.name || 'este tema'}
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Artigos relacionados para aprofundar seu conhecimento:
      </p>

      <ul className="space-y-3">
        {clusterArticles.map((article, index) => (
          <motion.li
            key={article.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              to={`/blog/${article.id}`}
              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-card transition-colors"
            >
              <ArrowRight className="w-4 h-4 mt-1 text-accent flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              <div>
                <span className="text-foreground group-hover:text-primary transition-colors font-medium">
                  {article.title}
                </span>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>

      {primaryCluster?.pillarSlug && primaryCluster.pillarSlug !== '/' && (
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            to={primaryCluster.pillarSlug}
            className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
          >
            Ver guia completo sobre {primaryCluster.name}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </motion.aside>
  );
};
