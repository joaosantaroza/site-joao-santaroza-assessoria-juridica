import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  TrendingUp, 
  Search, 
  Check,
  Sparkles,
  ExternalLink,
  BarChart3,
  Target,
  Clock,
  Zap
} from 'lucide-react';

interface TrendingTopic {
  title: string;
  description: string;
  keywords: string[];
  interest_level: string;
  category: string;
  seo_potential: string;
}

interface TrendingResearchProps {
  onSelectTopic: (topic: TrendingTopic) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'geral', label: 'Todas as Áreas' },
  { value: 'previdenciario', label: 'Previdenciário' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'tributario', label: 'Tributário' },
  { value: 'consumidor', label: 'Consumidor' },
  { value: 'familia', label: 'Família' },
  { value: 'saude', label: 'Saúde' },
];

const INTEREST_COLORS: Record<string, string> = {
  'alto': 'bg-green-500',
  'médio-alto': 'bg-yellow-500',
  'médio': 'bg-orange-500',
};

export function TrendingResearch({ onSelectTopic }: TrendingResearchProps) {
  const [isResearching, setIsResearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('geral');
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [researchSummary, setResearchSummary] = useState('');
  const [researchedAt, setResearchedAt] = useState<string | null>(null);
  const { toast } = useToast();

  const handleResearch = async () => {
    setIsResearching(true);
    setTrendingTopics([]);
    setResearchSummary('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-trending-topics`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ category: selectedCategory }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao pesquisar tópicos');
      }

      if (data.success && data.data) {
        setTrendingTopics(data.data.trending_topics || []);
        setResearchSummary(data.data.research_summary || '');
        setResearchedAt(data.data.researched_at);

        toast({
          title: 'Pesquisa concluída!',
          description: `${data.data.trending_topics?.length || 0} tópicos em alta identificados.`,
        });
      }
    } catch (error) {
      console.error('Error researching topics:', error);
      toast({
        title: 'Erro na pesquisa',
        description: error instanceof Error ? error.message : 'Não foi possível pesquisar os tópicos.',
        variant: 'destructive'
      });
    } finally {
      setIsResearching(false);
    }
  };

  const handleSelectTopic = (topic: TrendingTopic) => {
    onSelectTopic(topic);
    toast({
      title: 'Tópico selecionado!',
      description: 'O título foi definido. Agora gere o artigo com foco em SEO.',
    });
  };

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Pesquisa de Trending Topics</CardTitle>
            <CardDescription>
              Descubra os temas jurídicos em alta na semana usando Deep Research
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Research Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleResearch} 
            disabled={isResearching}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isResearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Pesquisando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Pesquisar Trending Topics
              </>
            )}
          </Button>
        </div>

        {/* Loading State */}
        {isResearching && (
          <div className="text-center py-8 space-y-3">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-amber-600" />
              <Zap className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-400 animate-pulse" />
            </div>
            <p className="text-muted-foreground">
              Realizando pesquisa profunda nos últimos 7 dias...
            </p>
            <p className="text-xs text-muted-foreground">
              Isso pode levar alguns segundos
            </p>
          </div>
        )}

        {/* Research Summary */}
        {researchSummary && !isResearching && (
          <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-sm">Resumo da Pesquisa</span>
              {researchedAt && (
                <Badge variant="outline" className="ml-auto text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(researchedAt).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{researchSummary}</p>
          </div>
        )}

        {/* Trending Topics List */}
        {trendingTopics.length > 0 && !isResearching && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-600" />
              Tópicos em Alta ({trendingTopics.length})
            </h4>
            
            <div className="grid gap-3">
              {trendingTopics.map((topic, index) => (
                <div 
                  key={index}
                  className="p-4 bg-white dark:bg-gray-900 rounded-lg border hover:border-amber-400 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-medium text-sm">{topic.title}</h5>
                        <Badge 
                          variant="secondary"
                          className={`${INTEREST_COLORS[topic.interest_level.toLowerCase()] || 'bg-gray-500'} text-white text-xs`}
                        >
                          {topic.interest_level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {topic.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {topic.description}
                      </p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {topic.keywords?.slice(0, 4).map((keyword, kidx) => (
                          <Badge key={kidx} variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/50">
                            {keyword}
                          </Badge>
                        ))}
                      </div>

                      {topic.seo_potential && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          SEO: {topic.seo_potential}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={() => handleSelectTopic(topic)}
                      className="shrink-0 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {trendingTopics.length === 0 && !isResearching && !researchSummary && (
          <div className="text-center py-6 text-muted-foreground">
            <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              Clique em "Pesquisar Trending Topics" para descobrir os temas jurídicos em alta esta semana.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
