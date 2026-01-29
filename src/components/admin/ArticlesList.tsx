import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  RefreshCw, 
  Trash2, 
  Eye, 
  EyeOff, 
  FileText,
  Calendar,
  Pencil,
  Clock
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { BlogPostEdit } from './ArticleForm';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string[];
  image_url: string | null;
  read_time: string;
  published: boolean;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ArticlesListProps {
  refreshTrigger?: number;
  onEditArticle?: (article: BlogPostEdit) => void;
}

export function ArticlesList({ refreshTrigger, onEditArticle }: ArticlesListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro ao carregar artigos',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const handleTogglePublish = async (post: BlogPost) => {
    setTogglingId(post.id);
    
    const { error } = await supabase
      .from('blog_posts')
      .update({ 
        published: !post.published,
        scheduled_at: null // Clear schedule when toggling
      })
      .eq('id', post.id);

    if (error) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setPosts(posts.map(p => 
        p.id === post.id ? { ...p, published: !p.published, scheduled_at: null } : p
      ));
      toast({
        title: post.published ? 'Artigo despublicado' : 'Artigo publicado',
        description: post.published 
          ? 'O artigo foi removido do site.' 
          : 'O artigo está visível no site.',
      });
    }
    setTogglingId(null);
  };

  const getPostStatus = (post: BlogPost) => {
    if (post.scheduled_at) {
      const scheduledDate = new Date(post.scheduled_at);
      const now = new Date();
      if (scheduledDate > now) {
        return 'scheduled';
      }
    }
    return post.published ? 'published' : 'draft';
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setPosts(posts.filter(p => p.id !== id));
      toast({
        title: 'Artigo excluído',
        description: 'O artigo foi removido com sucesso.'
      });
    }
    setDeletingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-heading">Artigos</CardTitle>
              <CardDescription>{posts.length} artigo(s) cadastrado(s)</CardDescription>
            </div>
          </div>
          <Button onClick={fetchPosts} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhum artigo cadastrado ainda.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Use o formulário acima para criar seu primeiro artigo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Data</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{post.excerpt}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(post.category || []).slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                        ))}
                        {(post.category || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">+{post.category.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {(() => {
                        const status = getPostStatus(post);
                        if (status === 'scheduled') {
                          return (
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="border-accent text-accent">
                                <Clock className="h-3 w-3 mr-1" />
                                Agendado
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(post.scheduled_at!), "dd/MM 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                          );
                        } else if (status === 'published') {
                          return (
                            <Badge className="bg-accent text-accent-foreground">
                              Publicado
                            </Badge>
                          );
                        } else {
                          return (
                            <Badge variant="outline">
                              Rascunho
                            </Badge>
                          );
                        }
                      })()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(post.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (onEditArticle) {
                              onEditArticle(post);
                            } else {
                              navigate(`/admin/artigos/${post.slug}`);
                            }
                          }}
                          title="Editar artigo"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(post)}
                          disabled={togglingId === post.id}
                          title={post.published ? 'Despublicar' : 'Publicar'}
                        >
                          {togglingId === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : post.published ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-accent" />
                          )}
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              disabled={deletingId === post.id}
                            >
                              {deletingId === post.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir artigo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O artigo "{post.title}" será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(post.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
