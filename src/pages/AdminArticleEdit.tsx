import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { ArticleForm, BlogPostEdit } from '@/components/admin/ArticleForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AdminArticleEdit() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<BlogPostEdit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        toast({
          title: 'Erro ao carregar artigo',
          description: error.message,
          variant: 'destructive'
        });
        setNotFound(true);
      } else if (!data) {
        setNotFound(true);
      } else {
        setArticle(data);
      }
      setIsLoading(false);
    };

    if (isAdmin) {
      fetchArticle();
    }
  }, [slug, isAdmin, toast]);

  const handleArticleSaved = () => {
    toast({
      title: 'Artigo salvo',
      description: 'As alterações foram salvas com sucesso.'
    });
    navigate('/admin/artigos');
  };

  const handleCancelEdit = () => {
    navigate('/admin/artigos');
  };

  if (authLoading || isLoading) {
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

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Artigo não encontrado</CardTitle>
            <CardDescription>
              O artigo que você está procurando não existe ou foi removido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin/artigos')} variant="outline" className="w-full">
              Voltar para Artigos
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
          onClick={() => navigate('/admin/artigos')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Artigos
        </Button>

        <ArticleForm 
          onSuccess={handleArticleSaved} 
          editingArticle={article}
          onCancelEdit={handleCancelEdit}
        />
      </div>
    </div>
  );
}
