import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Eye, 
  Calendar, 
  Target,
  BarChart3,
  ExternalLink,
  RefreshCw,
  Award,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrendingAnalytic {
  id: string;
  topic_title: string;
  category: string;
  interest_level: string | null;
  approved_at: string;
  article_id: string | null;
  article_title?: string;
  article_slug?: string;
  article_views?: number;
}

const INTEREST_COLORS: Record<string, string> = {
  'alto': 'bg-green-500',
  'médio-alto': 'bg-yellow-500',
  'médio': 'bg-orange-500',
};

export function TrendingAnalytics() {
  const [analytics, setAnalytics] = useState<TrendingAnalytic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApproved: 0,
    articlesGenerated: 0,
    totalViews: 0,
    topCategory: '',
  });
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    setIsLoading(true);
    
    // Fetch trending analytics with joined article data
    const { data, error } = await supabase
      .from('trending_topic_analytics')
      .select(`
        id,
        topic_title,
        category,
        interest_level,
        approved_at,
        article_id
      `)
      .order('approved_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching analytics:', error);
      setIsLoading(false);
      return;
    }

    // Fetch article details for those with article_id
    const articleIds = data?.filter(d => d.article_id).map(d => d.article_id) || [];
    let articlesMap: Record<string, { title: string; slug: string; view_count: number }> = {};

    if (articleIds.length > 0) {
      const { data: articles } = await supabase
        .from('blog_posts')
        .select('id, title, slug, view_count')
        .in('id', articleIds);

      if (articles) {
        articlesMap = articles.reduce((acc, article) => {
          acc[article.id] = { 
            title: article.title, 
            slug: article.slug, 
            view_count: article.view_count 
          };
          return acc;
        }, {} as Record<string, { title: string; slug: string; view_count: number }>);
      }
    }

    // Merge data
    const enrichedData = data?.map(item => ({
      ...item,
      article_title: item.article_id ? articlesMap[item.article_id]?.title : undefined,
      article_slug: item.article_id ? articlesMap[item.article_id]?.slug : undefined,
      article_views: item.article_id ? articlesMap[item.article_id]?.view_count : undefined,
    })) || [];

    setAnalytics(enrichedData);

    // Calculate stats
    const totalViews = enrichedData.reduce((acc, item) => acc + (item.article_views || 0), 0);
    const articlesGenerated = enrichedData.filter(item => item.article_id).length;
    
    // Find top category
    const categoryCount = enrichedData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    setStats({
      totalApproved: enrichedData.length,
      articlesGenerated,
      totalViews,
      topCategory,
    });

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading">Analytics de Trending Topics</CardTitle>
              <CardDescription>
                Acompanhe o desempenho dos temas aprovados
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Tópicos Aprovados</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalApproved}</p>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Artigos Gerados</span>
            </div>
            <p className="text-2xl font-bold">{stats.articlesGenerated}</p>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Total de Views</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalViews.toLocaleString('pt-BR')}</p>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Top Categoria</span>
            </div>
            <p className="text-lg font-bold truncate">{stats.topCategory}</p>
          </div>
        </div>

        {/* Analytics List */}
        {analytics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum tópico aprovado ainda.</p>
            <p className="text-sm">Use a pesquisa de Trending Topics para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Histórico de Aprovações
            </h4>
            
            <div className="divide-y divide-border">
              {analytics.map((item) => (
                <div 
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm truncate">{item.topic_title}</span>
                      {item.interest_level && (
                        <Badge 
                          variant="secondary"
                          className={`${INTEREST_COLORS[item.interest_level.toLowerCase()] || 'bg-gray-500'} text-white text-xs`}
                        >
                          {item.interest_level}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(item.approved_at)}</span>
                      
                      {item.article_id && item.article_slug && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => navigate(`/admin/artigos/${item.article_slug}`)}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver artigo
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    {item.article_views !== undefined ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.article_views.toLocaleString('pt-BR')}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Pendente
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
