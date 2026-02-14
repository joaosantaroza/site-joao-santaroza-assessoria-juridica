import { useState, useRef, useCallback } from 'react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Instagram, Copy, Check, Type, LayoutGrid, Sparkles, Eye, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Bookmark, Pencil, ImagePlus, X, CalendarIcon, Clock, Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Download, Wand2, RefreshCw } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [isSaving, setIsSaving] = useState(false);
  const [showDesktopPreview, setShowDesktopPreview] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  // Suggest best posting times
  const suggestedTimes = (() => {
    const base = new Date();
    return [
      { label: 'Amanhã 10h', date: setMinutes(setHours(addDays(base, 1), 10), 0) },
      { label: 'Amanhã 18h', date: setMinutes(setHours(addDays(base, 1), 18), 0) },
      { label: 'Em 3 dias 10h', date: setMinutes(setHours(addDays(base, 3), 10), 0) },
      { label: 'Em 1 semana 10h', date: setMinutes(setHours(addDays(base, 7), 10), 0) },
    ];
  })();

  const handleSchedulePost = async (type: 'caption' | 'carousel') => {
    const content = type === 'caption' ? captionResult : carouselResult;
    if (!content || !scheduleDate || !selectedArticle) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const scheduledAt = setMinutes(setHours(scheduleDate, hours), minutes);

    if (scheduledAt <= new Date()) {
      toast({ title: 'A data deve ser no futuro', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase.from('social_posts').insert({
        article_id: selectedArticle.id,
        article_title: selectedArticle.title,
        post_type: type,
        content: content as any,
        custom_image_url: customImageUrl,
        scheduled_at: scheduledAt.toISOString(),
        created_by: user.id,
      });

      if (error) throw error;

      toast({ title: 'Post agendado com sucesso! 📅' });
      setScheduleDate(undefined);
      setScheduleTime('10:00');
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: 'Erro ao agendar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Apenas imagens são aceitas', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande (máx. 10MB)', variant: 'destructive' });
      return;
    }
    const url = URL.createObjectURL(file);
    setCustomImageUrl(url);
    toast({ title: 'Imagem de capa atualizada! 🖼️' });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // selectedArticle defined above

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
    toast({ title: 'Copiado!' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExport = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Arquivo exportado!' });
  };

  const handleGenerateImage = async () => {
    if (!selectedArticle) {
      toast({ title: 'Selecione um artigo primeiro', variant: 'destructive' });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/regenerate-cover-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            title: selectedArticle.title,
            category: [],
            imageStyle: 'abstract',
            format: 'social',
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erro ao gerar imagem');
      }

      const data = await response.json();
      if (data.data?.coverImageUrl) {
        setCustomImageUrl(data.data.coverImageUrl);
        toast({ title: 'Imagem gerada com sucesso!' });
      } else {
        throw new Error('Nenhuma imagem retornada');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Erro ao gerar imagem',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };
  const handleRewriteOAB = async (target: 'caption' | 'carousel') => {
    const currentText = target === 'caption' ? captionResult?.legenda : carouselResult?.legenda;
    if (!currentText) {
      toast({ title: 'Gere o conteúdo primeiro', variant: 'destructive' });
      return;
    }

    setIsRewriting(true);
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
            title: selectedArticle?.title || '',
            excerpt: selectedArticle?.excerpt || '',
            content: currentText,
            type: 'rewrite',
            rewriteTarget: target,
            currentHashtags: target === 'caption' ? captionResult?.hashtags : carouselResult?.hashtags,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erro ao reescrever');
      }

      const data = await response.json();
      const result = data.result;

      if (target === 'caption' && captionResult) {
        setCaptionResult({
          ...captionResult,
          legenda: result.legenda || captionResult.legenda,
          hashtags: result.hashtags || captionResult.hashtags,
          gancho: result.gancho || captionResult.gancho,
        });
      } else if (target === 'carousel' && carouselResult) {
        setCarouselResult({
          ...carouselResult,
          legenda: result.legenda || carouselResult.legenda,
          hashtags: result.hashtags || carouselResult.hashtags,
        });
      }

      toast({ title: 'Legenda reescrita com tom OAB!' });
    } catch (error) {
      console.error('Error rewriting caption:', error);
      toast({
        title: 'Erro ao reescrever',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const buildCaptionExportText = () => {
    if (!captionResult || !selectedArticle) return '';
    return [
      `LEGENDA INSTAGRAM — ${selectedArticle.title}`,
      '',
      captionResult.gancho ? `GANCHO: ${captionResult.gancho}` : '',
      captionResult.gancho ? '' : '',
      captionResult.legenda,
      '',
      captionResult.hashtags?.join(' ') || '',
    ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n').trim();
  };

  const buildCarouselExportText = () => {
    if (!carouselResult || !selectedArticle) return '';
    const slides = carouselResult.slides
      ?.map(s => `[Slide ${s.slide} — ${s.type.toUpperCase()}]\n${s.titulo}\n${s.subtitulo || s.texto || ''}`)
      .join('\n\n');
    return [
      `CARROSSEL INSTAGRAM — ${selectedArticle.title}`,
      '',
      slides,
      '',
      '---',
      'LEGENDA:',
      carouselResult.legenda,
      '',
      carouselResult.hashtags?.join(' ') || '',
    ].join('\n').trim();
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

  const ScheduleSection = ({ type }: { type: 'caption' | 'carousel' }) => (
    <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CalendarIcon className="h-4 w-4 text-primary" />
        Agendar publicação
      </div>

      {/* Suggested times */}
      <div className="flex flex-wrap gap-2">
        {suggestedTimes.map((suggestion, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className={cn(
              "text-xs h-7",
              scheduleDate && scheduleTime === format(suggestion.date, 'HH:mm') &&
              format(scheduleDate, 'yyyy-MM-dd') === format(suggestion.date, 'yyyy-MM-dd')
                ? 'bg-primary text-primary-foreground'
                : ''
            )}
            onClick={() => {
              setScheduleDate(suggestion.date);
              setScheduleTime(format(suggestion.date, 'HH:mm'));
            }}
          >
            {suggestion.label}
          </Button>
        ))}
      </div>

      {/* Custom date/time */}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left text-sm font-normal",
                !scheduleDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {scheduleDate ? format(scheduleDate, "dd/MM/yyyy", { locale: ptBR }) : "Data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={scheduleDate}
              onSelect={setScheduleDate}
              disabled={(date) => date < new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <div className="relative">
          <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-[120px] pl-9 text-sm"
          />
        </div>
      </div>

      <Button
        className="w-full gap-2"
        disabled={!scheduleDate || isSaving}
        onClick={() => handleSchedulePost(type)}
      >
        {isSaving ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Agendando...</>
        ) : (
          <><CalendarIcon className="h-4 w-4" /> Agendar Post</>
        )}
      </Button>
    </div>
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
            ) : (customImageUrl || selectedArticle?.image_url) ? (
              <img src={customImageUrl || selectedArticle?.image_url || ''} alt="" className="w-full h-full object-cover" />
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

        {/* Cover image drop zone */}
        <div className="space-y-2">
          <Label>Imagem de capa (opcional)</Label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : customImageUrl
                ? 'border-border bg-muted/30'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
                e.target.value = '';
              }}
            />
            {customImageUrl ? (
              <div className="flex items-center gap-3">
                <img src={customImageUrl} alt="Capa personalizada" className="h-16 w-16 rounded-md object-cover" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Imagem personalizada</p>
                  <p className="text-xs text-muted-foreground">Clique ou arraste para substituir</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    URL.revokeObjectURL(customImageUrl);
                    setCustomImageUrl(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="py-2">
                <ImagePlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Substitui a capa do artigo no preview
                </p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 mt-2"
            disabled={isGeneratingImage || !selectedArticleId}
            onClick={handleGenerateImage}
          >
            {isGeneratingImage ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Gerando imagem...</>
            ) : (
              <><Wand2 className="h-4 w-4" /> Gerar Imagem com IA</>
            )}
          </Button>
        </div>

        {/* Preview toggle (desktop) */}
        <div className="hidden lg:flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => setShowDesktopPreview(!showDesktopPreview)}
          >
            <Eye className="h-3.5 w-3.5" />
            {showDesktopPreview ? 'Ocultar preview' : 'Mostrar preview'}
          </Button>
        </div>

        {/* Main layout: Controls + Preview side by side on desktop */}
        <div className={`grid grid-cols-1 ${showDesktopPreview ? 'lg:grid-cols-2' : ''} gap-6`}>
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
                  {/* Preview + Edit toggle (mobile) */}
                  <div className="flex gap-2 lg:hidden">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      className="gap-2"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Pencil className="h-4 w-4" />
                      {isEditing ? 'Salvar' : 'Editar'}
                    </Button>
                  </div>

                  {/* Desktop edit toggle */}
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    className="gap-2 hidden lg:inline-flex"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {isEditing ? 'Concluir edição' : 'Editar legenda'}
                  </Button>

                  {captionResult.gancho && (
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-accent">🎯 Gancho</span>
                        <CopyButton text={captionResult.gancho} field="gancho" />
                      </div>
                      {isEditing ? (
                        <Input
                          value={captionResult.gancho}
                          onChange={(e) => setCaptionResult({ ...captionResult, gancho: e.target.value })}
                          className="text-sm font-medium"
                        />
                      ) : (
                        <p className="text-sm font-medium">{captionResult.gancho}</p>
                      )}
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">📝 Legenda</span>
                      <CopyButton text={captionResult.legenda} field="legenda" />
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={captionResult.legenda}
                        onChange={(e) => setCaptionResult({ ...captionResult, legenda: e.target.value })}
                        className="text-sm leading-relaxed min-h-[120px]"
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-line leading-relaxed">{captionResult.legenda}</p>
                    )}
                  </div>

                  {captionResult.hashtags?.length > 0 && (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground"># Hashtags</span>
                        <CopyButton text={captionResult.hashtags.join(' ')} field="hashtags" />
                      </div>
                      {isEditing ? (
                        <Input
                          value={captionResult.hashtags.join(' ')}
                          onChange={(e) => setCaptionResult({
                            ...captionResult,
                            hashtags: e.target.value.split(/\s+/).filter(Boolean)
                          })}
                          className="text-sm"
                          placeholder="#hashtag1 #hashtag2"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {captionResult.hashtags.map((tag, i) => (
                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
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

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleExport(
                      buildCaptionExportText(),
                      `legenda-${selectedArticle?.slug || 'instagram'}.txt`
                    )}
                  >
                    <Download className="h-4 w-4" />
                    Exportar Legenda (.txt)
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full gap-2 border-accent text-accent hover:bg-accent/10"
                    disabled={isRewriting}
                    onClick={() => handleRewriteOAB('caption')}
                  >
                    {isRewriting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Reescrevendo...</>
                    ) : (
                      <><RefreshCw className="h-4 w-4" /> Reescrever Tom OAB</>
                    )}
                  </Button>

                  <ScheduleSection type="caption" />
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
                  {/* Preview button (mobile only) */}
                  <Button
                    variant="outline"
                    className="w-full gap-2 lg:hidden"
                    onClick={() => { setPreviewSlideIndex(0); setShowPreview(true); }}
                  >
                    <Eye className="h-4 w-4" />
                    Preview no Instagram
                  </Button>

                  {carouselResult.slides?.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">📱 Slides do Carrossel ({carouselResult.slides.length})</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            const newSlide = {
                              slide: carouselResult.slides.length + 1,
                              type: 'conteudo',
                              titulo: 'Novo slide',
                              texto: 'Texto do slide',
                            };
                            setCarouselResult({
                              ...carouselResult,
                              slides: [...carouselResult.slides, newSlide],
                            });
                            const newIndex = carouselResult.slides.length;
                            setEditingSlideIndex(newIndex);
                            setPreviewSlideIndex(newIndex);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                          Slide
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        {carouselResult.slides.map((slide, i) => {
                          const isEditingThis = editingSlideIndex === i;
                          const isSelected = i === previewSlideIndex;

                          const updateSlide = (field: string, value: string) => {
                            const newSlides = [...carouselResult.slides];
                            newSlides[i] = { ...newSlides[i], [field]: value };
                            setCarouselResult({ ...carouselResult, slides: newSlides });
                          };

                          const moveSlide = (dir: -1 | 1) => {
                            const newSlides = [...carouselResult.slides];
                            const target = i + dir;
                            if (target < 0 || target >= newSlides.length) return;
                            [newSlides[i], newSlides[target]] = [newSlides[target], newSlides[i]];
                            // Renumber
                            newSlides.forEach((s, idx) => { s.slide = idx + 1; });
                            setCarouselResult({ ...carouselResult, slides: newSlides });
                            setPreviewSlideIndex(target);
                            setEditingSlideIndex(isEditingThis ? target : editingSlideIndex);
                          };

                          const removeSlide = () => {
                            if (carouselResult.slides.length <= 2) {
                              toast({ title: 'Mínimo de 2 slides', variant: 'destructive' });
                              return;
                            }
                            const newSlides = carouselResult.slides.filter((_, idx) => idx !== i);
                            newSlides.forEach((s, idx) => { s.slide = idx + 1; });
                            setCarouselResult({ ...carouselResult, slides: newSlides });
                            setEditingSlideIndex(null);
                            setPreviewSlideIndex(Math.min(previewSlideIndex, newSlides.length - 1));
                          };

                          return (
                            <div
                              key={i}
                              className={`rounded-lg border transition-all ${
                                isSelected ? 'ring-2 ring-primary/50' : ''
                              } ${
                                slide.type === 'capa'
                                  ? 'bg-primary/5 border-primary/20'
                                  : slide.type === 'cta'
                                  ? 'bg-accent/5 border-accent/20'
                                  : 'bg-muted/50 border-border'
                              }`}
                            >
                              {/* Slide header — always visible, click to select & toggle edit */}
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                                onClick={() => {
                                  setPreviewSlideIndex(i);
                                  setEditingSlideIndex(isEditingThis ? null : i);
                                }}
                              >
                                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                                  {slide.slide}
                                </span>
                                <span className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">
                                  {slide.type === 'capa' ? '🎯' : slide.type === 'cta' ? '📲' : '📄'}
                                </span>
                                <span className="text-sm font-medium truncate flex-1">{slide.titulo}</span>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => { e.stopPropagation(); moveSlide(-1); }}
                                    disabled={i === 0}
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => { e.stopPropagation(); moveSlide(1); }}
                                    disabled={i === carouselResult.slides.length - 1}
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                  <Pencil className={`h-3 w-3 ml-1 transition-colors ${isEditingThis ? 'text-primary' : 'text-muted-foreground/40'}`} />
                                </div>
                              </div>

                              {/* Inline edit panel — expands when this slide is being edited */}
                              {isEditingThis && (
                                <div className="px-3 pb-3 space-y-2 animate-in slide-in-from-top-2 fade-in-0 duration-200" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex gap-2">
                                    <Select
                                      value={slide.type}
                                      onValueChange={(val) => updateSlide('type', val)}
                                    >
                                      <SelectTrigger className="w-[130px] h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="capa">🎯 Capa</SelectItem>
                                        <SelectItem value="conteudo">📄 Conteúdo</SelectItem>
                                        <SelectItem value="cta">📲 CTA</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <div className="flex-1" />
                                    <CopyButton
                                      text={`${slide.titulo}\n${slide.subtitulo || slide.texto || ''}`}
                                      field={`slide-${i}`}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive/60 hover:text-destructive"
                                      onClick={removeSlide}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                  <Input
                                    value={slide.titulo}
                                    onChange={(e) => updateSlide('titulo', e.target.value)}
                                    className="text-sm font-semibold"
                                    placeholder="Título do slide"
                                    autoFocus
                                  />
                                  <Textarea
                                    value={slide.subtitulo || slide.texto || ''}
                                    onChange={(e) => updateSlide(slide.subtitulo !== undefined ? 'subtitulo' : 'texto', e.target.value)}
                                    className="text-sm min-h-[60px]"
                                    placeholder="Texto do slide"
                                  />
                                </div>
                              )}

                              {/* Collapsed view — show text preview when not editing */}
                              {!isEditingThis && (slide.subtitulo || slide.texto) && (
                                <div className="px-3 pb-2">
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {slide.subtitulo || slide.texto}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {carouselResult.legenda && (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">📝 Legenda do Post</span>
                        <CopyButton text={carouselResult.legenda} field="carousel-legenda" />
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={carouselResult.legenda}
                          onChange={(e) => setCarouselResult({ ...carouselResult, legenda: e.target.value })}
                          className="text-sm leading-relaxed min-h-[100px]"
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-line leading-relaxed">{carouselResult.legenda}</p>
                      )}
                    </div>
                  )}

                  {carouselResult.hashtags?.length > 0 && (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground"># Hashtags</span>
                        <CopyButton text={carouselResult.hashtags.join(' ')} field="carousel-hashtags" />
                      </div>
                      {isEditing ? (
                        <Input
                          value={carouselResult.hashtags.join(' ')}
                          onChange={(e) => setCarouselResult({
                            ...carouselResult,
                            hashtags: e.target.value.split(/\s+/).filter(Boolean)
                          })}
                          className="text-sm"
                          placeholder="#hashtag1 #hashtag2"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {carouselResult.hashtags.map((tag, i) => (
                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
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

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleExport(
                      buildCarouselExportText(),
                      `carrossel-${selectedArticle?.slug || 'instagram'}.txt`
                    )}
                  >
                    <Download className="h-4 w-4" />
                    Exportar Carrossel (.txt)
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full gap-2 border-accent text-accent hover:bg-accent/10"
                    disabled={isRewriting}
                    onClick={() => handleRewriteOAB('carousel')}
                  >
                    {isRewriting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Reescrevendo...</>
                    ) : (
                      <><RefreshCw className="h-4 w-4" /> Reescrever Tom OAB</>
                    )}
                  </Button>

                  <ScheduleSection type="carousel" />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Right: Instagram phone preview (desktop) - toggle */}
          {showDesktopPreview && (
            <div className="hidden lg:flex flex-col items-center justify-start pt-12 sticky top-8 animate-in slide-in-from-right-4 fade-in-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Preview ao vivo</p>
              </div>
              <InstagramPreview />
            </div>
          )}
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
