import { useState, useEffect } from 'react';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, CheckCircle2, XCircle, Clock, Instagram, Loader2, Trash2, LayoutGrid, Type } from 'lucide-react';

interface SocialPost {
  id: string;
  article_title: string;
  post_type: string;
  scheduled_at: string;
  status: string;
  created_at: string;
}

export function ScheduledPostsQueue() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('social_posts')
      .select('id, article_title, post_type, scheduled_at, status, created_at')
      .order('scheduled_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching social posts:', error);
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const updateStatus = async (id: string, status: 'published' | 'cancelled') => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('social_posts')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    } else {
      toast({ title: status === 'published' ? 'Marcado como publicado! ✅' : 'Post cancelado' });
      fetchPosts();
    }
    setUpdatingId(null);
  };

  const deletePost = async (id: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    } else {
      toast({ title: 'Post excluído' });
      fetchPosts();
    }
    setUpdatingId(null);
  };

  const statusConfig = {
    scheduled: { label: 'Agendado', variant: 'default' as const, icon: Clock },
    published: { label: 'Publicado', variant: 'secondary' as const, icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', variant: 'outline' as const, icon: XCircle },
  };

  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const pastPosts = posts.filter(p => p.status !== 'scheduled');

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Fila de Publicações
        </CardTitle>
        <CardDescription>
          Posts agendados para publicação no Instagram. Publique manualmente e marque como concluído.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upcoming scheduled */}
        {scheduledPosts.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              📅 Próximos ({scheduledPosts.length})
            </h3>
            {scheduledPosts.map(post => {
              const isOverdue = isPast(new Date(post.scheduled_at));
              const config = statusConfig[post.status as keyof typeof statusConfig] || statusConfig.scheduled;
              const StatusIcon = config.icon;

              return (
                <div
                  key={post.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isOverdue
                      ? 'border-destructive/30 bg-destructive/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.post_type === 'carousel' ? (
                          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <Type className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        <p className="text-sm font-medium truncate">{post.article_title}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                          {isOverdue ? '⚠️ Atrasado: ' : ''}
                          {format(new Date(post.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        <Badge variant={config.variant} className="text-[10px] h-5">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        disabled={updatingId === post.id}
                        onClick={() => updateStatus(post.id, 'published')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Publicado
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground"
                        disabled={updatingId === post.id}
                        onClick={() => updateStatus(post.id, 'cancelled')}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Instagram className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum post agendado</p>
            <p className="text-xs mt-1">Gere uma legenda ou carrossel e agende para começar.</p>
          </div>
        )}

        {/* Past posts */}
        {pastPosts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Histórico ({pastPosts.length})
            </h3>
            {pastPosts.map(post => {
              const config = statusConfig[post.status as keyof typeof statusConfig] || statusConfig.scheduled;
              const StatusIcon = config.icon;

              return (
                <div key={post.id} className="p-3 rounded-lg border border-border bg-muted/20 opacity-70">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm truncate">{post.article_title}</p>
                        <Badge variant={config.variant} className="text-[10px] h-5 shrink-0">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(post.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      disabled={updatingId === post.id}
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
