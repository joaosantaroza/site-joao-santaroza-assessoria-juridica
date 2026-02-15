import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Clock,
  Download
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
  pdf_url: string | null;
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const postsWithPdf = posts.filter(p => p.pdf_url);
  const selectedPosts = posts.filter(p => selectedIds.has(p.id));
  const selectedWithPdf = selectedPosts.filter(p => p.pdf_url);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === postsWithPdf.length && postsWithPdf.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(postsWithPdf.map(p => p.id)));
    }
  }, [postsWithPdf, selectedIds]);

  const handleBatchDownload = async () => {
    if (selectedWithPdf.length === 0) return;
    setIsDownloadingBatch(true);
    toast({ title: `Baixando ${selectedWithPdf.length} PDFs...` });
    for (let i = 0; i < selectedWithPdf.length; i++) {
      const post = selectedWithPdf[i];
      const a = document.createElement('a');
      a.href = post.pdf_url!;
      a.download = `${post.slug}.pdf`;
      a.target = '_blank';
      a.click();
      if (i < selectedWithPdf.length - 1) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
    setIsDownloadingBatch(false);
    setSelectedIds(new Set());
    toast({ title: `${selectedWithPdf.length} PDFs baixados!` });
  };

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
              <CardDescription>Gerencie seus artigos do blog</CardDescription>
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
          <div className="overflow-x-auto space-y-3">
            {/* Batch action bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-accent/30 bg-accent/5 animate-in fade-in-0 slide-in-from-top-2">
                <span className="text-sm font-medium">
                  {selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}
                </span>
                <div className="flex-1" />
                {selectedWithPdf.length > 0 && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={handleBatchDownload}
                    disabled={isDownloadingBatch}
                  >
                    {isDownloadingBatch ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Baixar {selectedWithPdf.length} PDF{selectedWithPdf.length > 1 ? 's' : ''}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                  Limpar
                </Button>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={postsWithPdf.length > 0 && selectedIds.size === postsWithPdf.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Selecionar todos com PDF"
                      disabled={postsWithPdf.length === 0}
                    />
                  </TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Data</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id} className={selectedIds.has(post.id) ? 'bg-accent/5' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(post.id)}
                        onCheckedChange={() => toggleSelect(post.id)}
                        disabled={!post.pdf_url}
                        aria-label={`Selecionar ${post.title}`}
                      />
                    </TableCell>
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
                        {post.pdf_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = post.pdf_url!;
                              a.download = `${post.slug}.pdf`;
                              a.target = '_blank';
                              a.click();
                            }}
                            title="Baixar PDF"
                          >
                            <Download className="h-4 w-4 text-accent" />
                          </Button>
                        )}
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
