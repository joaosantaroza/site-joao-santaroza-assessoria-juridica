import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogArticle, BLOG_ARTICLES } from "@/lib/constants";

interface DatabaseArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  read_time: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  has_ebook?: boolean;
  ebook_title?: string | null;
  ebook_subtitle?: string | null;
  ebook_pdf_url?: string | null;
  ebook_cover_url?: string | null;
}

// Transform database article to BlogArticle format
const transformArticle = (dbArticle: DatabaseArticle): BlogArticle => ({
  id: dbArticle.slug,
  dbId: dbArticle.id,
  title: dbArticle.title,
  excerpt: dbArticle.excerpt,
  content: dbArticle.content,
  category: dbArticle.category,
  date: new Date(dbArticle.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }),
  readTime: dbArticle.read_time,
  image: dbArticle.image_url || 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  hasEbook: dbArticle.has_ebook || false,
  ebookTitle: dbArticle.ebook_title || undefined,
  ebookSubtitle: dbArticle.ebook_subtitle || undefined,
  ebookPdfUrl: dbArticle.ebook_pdf_url || undefined,
  ebookCoverUrl: dbArticle.ebook_cover_url || undefined,
});

export const useBlogArticles = () => {
  const [dbArticles, setDbArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching articles:', fetchError);
          setError(fetchError.message);
          return;
        }

        if (data) {
          const transformed = data.map(transformArticle);
          setDbArticles(transformed);
        }
      } catch (err) {
        console.error('Unexpected error fetching articles:', err);
        setError('Erro ao carregar artigos');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Combine static articles with database articles
  // Database articles come first, then static articles that don't have the same ID
  const allArticles = useMemo(() => {
    const dbIds = new Set(dbArticles.map(a => a.id));
    const staticArticlesFiltered = BLOG_ARTICLES.filter(a => !dbIds.has(a.id));
    return [...dbArticles, ...staticArticlesFiltered];
  }, [dbArticles]);

  // Get all unique categories
  const categories = useMemo(() => {
    return [...new Set(allArticles.map(a => a.category))];
  }, [allArticles]);

  // Find article by ID (checks both DB and static)
  const findArticleById = (id: string): BlogArticle | undefined => {
    return allArticles.find(a => a.id === id);
  };

  return {
    articles: allArticles,
    dbArticles,
    staticArticles: BLOG_ARTICLES,
    categories,
    loading,
    error,
    findArticleById
  };
};
