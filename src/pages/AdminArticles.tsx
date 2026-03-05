import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShieldAlert, BarChart3, Instagram, Search } from 'lucide-react';
import { ArticleForm, BlogPostEdit } from '@/components/admin/ArticleForm';
import { ArticlesList } from '@/components/admin/ArticlesList';
import { TrendingAnalytics } from '@/components/admin/TrendingAnalytics';
import { SocialCaptionGenerator } from '@/components/admin/SocialCaptionGenerator';
import { ScheduledPostsQueue } from '@/components/admin/ScheduledPostsQueue';
import { SEODashboard } from '@/components/admin/SEODashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminArticles() {
  const { isAdmin, isLoading } = useAuth();
  const [articleRefreshTrigger, setArticleRefreshTrigger] = useState(0);
  const [editingArticle, setEditingArticle] = useState<BlogPostEdit | null>(null);
  const [publishedArticles, setPublishedArticles] = useState<{ id: string; title: string; excerpt: string; content: string; slug: string; image_url?: string | null; category?: string[] | null }[]>([]);
  const navigate = useNavigate();

  // Fetch published articles for social caption generator
  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, content, slug, image_url, category')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (data) setPublishedArticles(data);
    };
    if (isAdmin) fetchArticles();
  }, [isAdmin, articleRefreshTrigger]);

  const handleArticleSaved = () => {
    setArticleRefreshTrigger(prev => prev + 1);
    setEditingArticle(null);
  };

  const handleEditArticle = (article: BlogPostEdit) => {
    setEditingArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingArticle(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Acesso Restrito</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin')} variant="outline" className="w-full">
              Voltar ao Painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Painel
        </Button>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="articles" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Criar & Gerenciar
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Instagram className="h-4 w-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <ArticleForm 
              onSuccess={handleArticleSaved} 
              editingArticle={editingArticle}
              onCancelEdit={handleCancelEdit}
            />
            <ArticlesList 
              refreshTrigger={articleRefreshTrigger} 
              onEditArticle={handleEditArticle}
            />
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialCaptionGenerator articles={publishedArticles} />
            <ScheduledPostsQueue />
          </TabsContent>

          <TabsContent value="analytics">
            <TrendingAnalytics />
          </TabsContent>

          <TabsContent value="seo">
            <SEODashboard articles={publishedArticles} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
