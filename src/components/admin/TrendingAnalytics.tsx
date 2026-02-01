import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Eye, 
  Calendar, 
  Target,
  BarChart3,
  ExternalLink,
  RefreshCw,
  Award,
  Sparkles,
  Trophy,
  Medal,
  ArrowUp,
  ArrowDown
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

const PODIUM_STYLES = [
  { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-400/30' },
  { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30' },
];

export function TrendingAnalytics() {
  const [analytics, setAnalytics] = useState<TrendingAnalytic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ranking' | 'history'>('ranking');
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

  // Ranked analytics sorted by views (highest first)
  const rankedAnalytics = useMemo(() => {
    return [...analytics]
      .filter(item => item.article_id && item.article_views !== undefined)
      .sort((a, b) => (b.article_views || 0) - (a.article_views || 0));
  }, [analytics]);

  // Category performance summary
  const categoryPerformance = useMemo(() => {
    const categoryData: Record<string, { views: number; count: number }> = {};
    
    analytics.forEach(item => {
      if (item.article_views !== undefined) {
        if (!categoryData[item.category]) {
          categoryData[item.category] = { views: 0, count: 0 };
        }
        categoryData[item.category].views += item.article_views;
        categoryData[item.category].count += 1;
      }
    });

    return Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        totalViews: data.views,
        avgViews: Math.round(data.views / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.totalViews - a.totalViews);
  }, [analytics]);

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

        {/* Tabs for Ranking vs History */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ranking' | 'history')}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="ranking" className="gap-2">
              <Trophy className="h-4 w-4" />
              Ranking de Performance
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Calendar className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="space-y-4 mt-4">
            {rankedAnalytics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum artigo com views ainda.</p>
                <p className="text-sm">Gere artigos a partir de trending topics para começar.</p>
              </div>
            ) : (
              <>
                {/* Top 3 Podium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {rankedAnalytics.slice(0, 3).map((item, index) => {
                    const style = PODIUM_STYLES[index];
                    const Icon = style.icon;
                    return (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-lg border ${style.border} ${style.bg} relative`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`flex items-center gap-1 ${style.color}`}>
                            <Icon className="h-5 w-5" />
                            <span className="font-bold">#{index + 1}</span>
                          </div>
                          <div className="flex items-center gap-1 text-lg font-bold">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {item.article_views?.toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2 mb-2">{item.topic_title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          {item.article_slug && (
                            <button
                              onClick={() => navigate(`/admin/artigos/${item.article_slug}`)}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rest of ranking */}
                {rankedAnalytics.length > 3 && (
                  <div className="divide-y divide-border rounded-lg border">
                    {rankedAnalytics.slice(3).map((item, index) => (
                      <div 
                        key={item.id}
                        className="p-3 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-sm font-medium text-muted-foreground w-6">
                            #{index + 4}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm truncate block">{item.topic_title}</span>
                            <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {item.article_slug && (
                            <button
                              onClick={() => navigate(`/admin/artigos/${item.article_slug}`)}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver
                            </button>
                          )}
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {item.article_views?.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Category Performance Summary */}
                {categoryPerformance.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4" />
                      Performance por Categoria
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {categoryPerformance.slice(0, 4).map((cat, index) => (
                        <div key={cat.category} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-1 mb-1">
                            {index === 0 && <ArrowUp className="h-3 w-3 text-green-500" />}
                            <span className="text-xs font-medium truncate">{cat.category}</span>
                          </div>
                          <p className="text-lg font-bold">{cat.totalViews.toLocaleString('pt-BR')}</p>
                          <p className="text-xs text-muted-foreground">
                            Média: {cat.avgViews.toLocaleString('pt-BR')} views
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            {analytics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum tópico aprovado ainda.</p>
                <p className="text-sm">Use a pesquisa de Trending Topics para começar.</p>
              </div>
            ) : (
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
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
