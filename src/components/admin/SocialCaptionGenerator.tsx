import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Instagram, Copy, Check, Type, LayoutGrid, Sparkles, Eye, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';

interface SocialCaptionGeneratorProps {
  articles: { id: string; title: string; excerpt: string; content: string; slug: string; image_url?: string | null }[];
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
  const [showPreview, setShowPreview] = useState(false);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
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
        setPreviewSlideIndex(0);
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

  const hasResult = captionResult || carouselResult;
  const previewLegenda = captionResult?.legenda || carouselResult?.legenda || '';
  const previewHashtags = captionResult?.hashtags || carouselResult?.hashtags || [];

  // Instagram Phone Preview Component
  const InstagramPreview = ({ inModal = false }: { inModal?: boolean }) => {
    const currentSlide = carouselResult?.slides?.[previewSlideIndex];
    const totalSlides = carouselResult?.slides?.length || 0;

    return (
      <div className={`bg-black rounded-[2rem] p-2 shadow-2xl ${inModal ? 'w-[340px]' : 'w-full max-w-[320px]'} mx-auto`}>
        {/* Phone notch */}
        <div className="bg-black rounded-t-[1.75rem] pt-2 pb-1 flex justify-center">
          <div className="w-20 h-5 bg-black rounded-b-2xl" />
        </div>

        <div className="bg-background rounded-[1.5rem] overflow-hidden">
          {/* IG Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <span className="text-[10px] font-bold">⚖️</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight">joaosantaroza.adv</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Maringá, PR</p>
            </div>
          </div>

          {/* Image / Slide area */}
          <div className="relative aspect-square bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center overflow-hidden">
            {carouselResult && currentSlide ? (
              <>
                {/* Carousel slide content */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center ${
                  currentSlide.type === 'capa'
                    ? 'bg-gradient-to-br from-primary to-primary/80'
                    : currentSlide.type === 'cta'
                    ? 'bg-gradient-to-br from-accent to-accent/80'
                    : 'bg-gradient-to-br from-muted to-muted/80'
                }`}>
                  {currentSlide.type === 'capa' && (
                    <span className="text-[10px] uppercase tracking-widest text-primary-foreground/60 mb-2">Deslize →</span>
                  )}
                  <h3 className={`font-bold leading-tight mb-2 ${
                    currentSlide.type === 'capa' ? 'text-lg text-primary-foreground' : 'text-base text-foreground'
                  }`}>
                    {currentSlide.titulo}
                  </h3>
                  {(currentSlide.subtitulo || currentSlide.texto) && (
                    <p className={`text-sm leading-snug ${
                      currentSlide.type === 'capa' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      {currentSlide.subtitulo || currentSlide.texto}
                    </p>
                  )}
                </div>

                {/* Carousel navigation */}
                {totalSlides > 1 && (
                  <>
                    {previewSlideIndex > 0 && (
                      <button
                        onClick={() => setPreviewSlideIndex(i => i - 1)}
                        className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center shadow-md"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}
                    {previewSlideIndex < totalSlides - 1 && (
                      <button
                        onClick={() => setPreviewSlideIndex(i => i + 1)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center shadow-md"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </>
            ) : selectedArticle?.image_url ? (
              <img src={selectedArticle.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <Instagram className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground/60">Preview da publicação</p>
              </div>
            )}
          </div>

          {/* Carousel dots */}
          {carouselResult && totalSlides > 1 && (
            <div className="flex justify-center gap-1 py-2">
              {carouselResult.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewSlideIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === previewSlideIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* IG Action buttons */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-foreground" />
              <MessageCircle className="h-5 w-5 text-foreground" />
              <Send className="h-5 w-5 text-foreground" />
            </div>
            <Bookmark className="h-5 w-5 text-foreground" />
          </div>

          {/* Caption preview */}
          <div className="px-3 pb-3 max-h-32 overflow-y-auto">
            <p className="text-xs leading-relaxed">
              <span className="font-semibold mr-1">joaosantaroza.adv</span>
              {previewLegenda ? (
                previewLegenda.length > 120 ? previewLegenda.substring(0, 120) + '... mais' : previewLegenda
              ) : (
                <span className="text-muted-foreground italic">A legenda aparecerá aqui...</span>
              )}
            </p>
            {previewHashtags.length > 0 && (
              <p className="text-xs text-primary/70 mt-1">
                {previewHashtags.slice(0, 5).join(' ')}
                {previewHashtags.length > 5 && ' ...'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

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

        {/* Main layout: Controls + Preview side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Generation controls & results */}
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
                  {/* Preview button (mobile) */}
                  <Button
                    variant="outline"
                    className="w-full gap-2 lg:hidden"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="h-4 w-4" />
                    Pré-visualizar no Instagram
                  </Button>

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
                  {/* Preview button (mobile) */}
                  <Button
                    variant="outline"
                    className="w-full gap-2 lg:hidden"
                    onClick={() => { setPreviewSlideIndex(0); setShowPreview(true); }}
                  >
                    <Eye className="h-4 w-4" />
                    Pré-visualizar no Instagram
                  </Button>

                  {carouselResult.slides?.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-medium text-muted-foreground">📱 Slides do Carrossel</span>
                      <div className="grid gap-3">
                        {carouselResult.slides.map((slide, i) => (
                          <div
                            key={i}
                            onClick={() => setPreviewSlideIndex(i)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              i === previewSlideIndex ? 'ring-2 ring-primary/50 ' : ''
                            }${
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

          {/* Right: Instagram phone preview (desktop) */}
          <div className="hidden lg:flex flex-col items-center justify-start pt-12 sticky top-8">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Pré-visualização</p>
            <InstagramPreview />
          </div>
        </div>
      </CardContent>

      {/* Mobile preview modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[400px] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview Instagram
            </DialogTitle>
          </DialogHeader>
          <InstagramPreview inModal />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
