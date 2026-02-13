import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Instagram, Copy, Check, Type, LayoutGrid, Sparkles } from 'lucide-react';

interface SocialCaptionGeneratorProps {
  articles: { id: string; title: string; excerpt: string; content: string; slug: string }[];
}

interface CaptionResult {
  legenda: string;
  hashtags: string[];
  gancho?: string;
}

interface CarouselResult {
  slides: { slide: number; type: string; titulo: string; subtitulo?: string; texto?: string }[];
  legenda: string;
  hashtags: string[];
}

export function SocialCaptionGenerator({ articles }: SocialCaptionGeneratorProps) {
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [captionResult, setCaptionResult] = useState<CaptionResult | null>(null);
  const [carouselResult, setCarouselResult] = useState<CarouselResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  const handleGenerate = async (type: 'caption' | 'carousel') => {
    if (!selectedArticle) {
      toast({ title: 'Selecione um artigo', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setCaptionResult(null);
    setCarouselResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-social-caption`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            title: selectedArticle.title,
            excerpt: selectedArticle.excerpt,
            content: selectedArticle.content,
            type,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erro ao gerar conteúdo');
      }

      const data = await response.json();

      if (type === 'caption') {
        setCaptionResult(data.result);
      } else {
        setCarouselResult(data.result);
      }

      toast({ title: 'Conteúdo gerado com sucesso! ✨' });
    } catch (error) {
      console.error('Error generating social caption:', error);
      toast({
        title: 'Erro ao gerar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: 'Copiado! 📋' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleCopy(text, field)}
      className="gap-1.5 text-xs"
    >
      {copiedField === field ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copiedField === field ? 'Copiado' : 'Copiar'}
    </Button>
  );

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Instagram className="h-5 w-5 text-pink-500" />
          Gerador de Legendas Instagram
        </CardTitle>
        <CardDescription>
          Gere legendas e carrosséis otimizados a partir dos seus artigos publicados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Article selector */}
        <div className="space-y-2">
          <Label>Artigo base</Label>
          <Select value={selectedArticleId} onValueChange={setSelectedArticleId}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecione um artigo..." />
            </SelectTrigger>
            <SelectContent>
              {articles.map(article => (
                <SelectItem key={article.id} value={article.id}>
                  {article.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generation tabs */}
        <Tabs defaultValue="caption" className="space-y-4">
          <TabsList className="bg-muted/50 border border-border w-full">
            <TabsTrigger value="caption" className="flex-1 gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Type className="h-4 w-4" />
              Legenda
            </TabsTrigger>
            <TabsTrigger value="carousel" className="flex-1 gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <LayoutGrid className="h-4 w-4" />
              Carrossel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="caption" className="space-y-4">
            <Button
              onClick={() => handleGenerate('caption')}
              disabled={isGenerating || !selectedArticleId}
              className="w-full gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Gerando legenda...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Gerar Legenda</>
              )}
            </Button>

            {captionResult && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4">
                {captionResult.gancho && (
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-accent">🎯 Gancho</span>
                      <CopyButton text={captionResult.gancho} field="gancho" />
                    </div>
                    <p className="text-sm font-medium">{captionResult.gancho}</p>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">📝 Legenda</span>
                    <CopyButton text={captionResult.legenda} field="legenda" />
                  </div>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{captionResult.legenda}</p>
                </div>

                {captionResult.hashtags?.length > 0 && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground"># Hashtags</span>
                      <CopyButton text={captionResult.hashtags.join(' ')} field="hashtags" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {captionResult.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleCopy(
                    `${captionResult.legenda}\n\n${captionResult.hashtags?.join(' ') || ''}`,
                    'all-caption'
                  )}
                >
                  {copiedField === 'all-caption' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copiar Tudo
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="carousel" className="space-y-4">
            <Button
              onClick={() => handleGenerate('carousel')}
              disabled={isGenerating || !selectedArticleId}
              className="w-full gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Gerando carrossel...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Gerar Carrossel</>
              )}
            </Button>

            {carouselResult && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4">
                {/* Slides */}
                {carouselResult.slides?.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-medium text-muted-foreground">📱 Slides do Carrossel</span>
                    <div className="grid gap-3">
                      {carouselResult.slides.map((slide, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg border ${
                            slide.type === 'capa'
                              ? 'bg-primary/5 border-primary/20'
                              : slide.type === 'cta'
                              ? 'bg-accent/5 border-accent/20'
                              : 'bg-muted/50 border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {slide.slide}
                              </span>
                              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                {slide.type === 'capa' ? '🎯 Capa' : slide.type === 'cta' ? '📲 CTA' : '📄 Conteúdo'}
                              </span>
                            </div>
                            <CopyButton
                              text={`${slide.titulo}\n${slide.subtitulo || slide.texto || ''}`}
                              field={`slide-${i}`}
                            />
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{slide.titulo}</h4>
                          {slide.subtitulo && (
                            <p className="text-sm text-muted-foreground">{slide.subtitulo}</p>
                          )}
                          {slide.texto && (
                            <p className="text-sm text-muted-foreground">{slide.texto}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caption for carousel */}
                {carouselResult.legenda && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">📝 Legenda do Post</span>
                      <CopyButton text={carouselResult.legenda} field="carousel-legenda" />
                    </div>
                    <p className="text-sm whitespace-pre-line leading-relaxed">{carouselResult.legenda}</p>
                  </div>
                )}

                {carouselResult.hashtags?.length > 0 && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground"># Hashtags</span>
                      <CopyButton text={carouselResult.hashtags.join(' ')} field="carousel-hashtags" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {carouselResult.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    const allSlides = carouselResult.slides
                      ?.map(s => `[Slide ${s.slide} - ${s.type.toUpperCase()}]\n${s.titulo}\n${s.subtitulo || s.texto || ''}`)
                      .join('\n\n');
                    handleCopy(
                      `${allSlides}\n\n---\nLEGENDA:\n${carouselResult.legenda}\n\n${carouselResult.hashtags?.join(' ') || ''}`,
                      'all-carousel'
                    );
                  }}
                >
                  {copiedField === 'all-carousel' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copiar Tudo
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
