import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { ArticleForm, BlogPostEdit } from '@/components/admin/ArticleForm';
import { ArticlesList } from '@/components/admin/ArticlesList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminArticles() {
  const { isAdmin, isLoading } = useAuth();
  const [articleRefreshTrigger, setArticleRefreshTrigger] = useState(0);
  const [editingArticle, setEditingArticle] = useState<BlogPostEdit | null>(null);
  const navigate = useNavigate();

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

        <div className="space-y-6">
          <ArticleForm 
            onSuccess={handleArticleSaved} 
            editingArticle={editingArticle}
            onCancelEdit={handleCancelEdit}
          />
          <ArticlesList 
            refreshTrigger={articleRefreshTrigger} 
            onEditArticle={handleEditArticle}
          />
        </div>
      </div>
    </div>
  );
}
