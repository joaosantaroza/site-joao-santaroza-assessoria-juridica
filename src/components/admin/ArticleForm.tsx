import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { ArticlePreviewModal } from './ArticlePreviewModal';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  Sparkles, 
  Save, 
  FileText,
  Image as ImageIcon,
  Tag,
  Clock,
  Eye,
  EyeOff,
  X,
  Pencil,
  Upload,
  Trash2,
  MonitorPlay,
  CalendarIcon
} from 'lucide-react';

export interface BlogPostEdit {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  read_time: string;
  published: boolean;
  scheduled_at?: string | null;
}

interface ArticleFormProps {
  onSuccess?: () => void;
  editingArticle?: BlogPostEdit | null;
  onCancelEdit?: () => void;
}

export function ArticleForm({ onSuccess, editingArticle, onCancelEdit }: ArticleFormProps) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Isenção Fiscal');
  const [imageUrl, setImageUrl] = useState('');
  const [readTime, setReadTime] = useState('5 min');
  const [published, setPublished] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Populate form when editing
  useEffect(() => {
    if (editingArticle) {
      setTitle(editingArticle.title);
      setExcerpt(editingArticle.excerpt);
      setContent(editingArticle.content);
      setCategory(editingArticle.category);
      setImageUrl(editingArticle.image_url || '');
      setReadTime(editingArticle.read_time);
      setPublished(editingArticle.published);
      if (editingArticle.scheduled_at) {
        setScheduledAt(new Date(editingArticle.scheduled_at));
        setIsScheduled(true);
      } else {
        setScheduledAt(undefined);
        setIsScheduled(false);
      }
    } else {
      resetForm();
    }
  }, [editingArticle]);

  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('Isenção Fiscal');
    setImageUrl('');
    setReadTime('5 min');
    setPublished(false);
    setScheduledAt(undefined);
    setIsScheduled(false);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Use imagens JPG, PNG, WebP ou GIF.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 5MB.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);

      toast({
        title: 'Imagem enviada!',
        description: 'A imagem foi carregada com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Não foi possível enviar a imagem.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  const handleGenerateWithAI = async () => {
    if (!title || title.trim().length < 5) {
      toast({
        title: 'Título necessário',
        description: 'Digite um título com pelo menos 5 caracteres para gerar o conteúdo.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-article`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ title: title.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar conteúdo');
      }

      if (data.success && data.data) {
        setContent(data.data.content);
        setExcerpt(data.data.excerpt);
        setCategory(data.data.category || category);
        setReadTime(data.data.readTime || readTime);

        toast({
          title: 'Conteúdo gerado!',
          description: 'O artigo foi gerado com sucesso. Revise antes de publicar.',
        });
      }
    } catch (error) {
      console.error('Error generating article:', error);
      toast({
        title: 'Erro na geração',
        description: error instanceof Error ? error.message : 'Não foi possível gerar o conteúdo.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: 'Título obrigatório', variant: 'destructive' });
      return;
    }
    if (!excerpt.trim()) {
      toast({ title: 'Resumo obrigatório', variant: 'destructive' });
      return;
    }
    if (!content.trim()) {
      toast({ title: 'Conteúdo obrigatório', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      const slug = generateSlug(title);
      const postData = {
        title: title.trim(),
        slug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        category: category.trim(),
        image_url: imageUrl.trim() || null,
        read_time: readTime.trim(),
        published: isScheduled ? true : published,
        scheduled_at: isScheduled && scheduledAt ? scheduledAt.toISOString() : null,
      };

      if (editingArticle) {
        // Update existing article
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingArticle.id);

        if (error) {
          if (error.code === '23505') {
            throw new Error('Já existe um artigo com este título. Escolha outro.');
          }
          throw error;
        }

        toast({
          title: 'Artigo atualizado!',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        // Create new article
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);

        if (error) {
          if (error.code === '23505') {
            throw new Error('Já existe um artigo com este título. Escolha outro.');
          }
          throw error;
        }

        toast({
          title: published ? 'Artigo publicado!' : 'Rascunho salvo!',
          description: published 
            ? 'O artigo está disponível no site.' 
            : 'O rascunho foi salvo com sucesso.',
        });
      }

      resetForm();
      onCancelEdit?.();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Não foi possível salvar o artigo.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit?.();
  };

  return (
    <Card className={`border-border bg-card ${editingArticle ? 'ring-2 ring-accent' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${editingArticle ? 'bg-accent/20' : 'bg-accent/10'}`}>
              {editingArticle ? (
                <Pencil className="h-5 w-5 text-accent" />
              ) : (
                <FileText className="h-5 w-5 text-accent" />
              )}
            </div>
            <div>
              <CardTitle className="font-heading">
                {editingArticle ? 'Editar Artigo' : 'Novo Artigo'}
              </CardTitle>
              <CardDescription>
                {editingArticle 
                  ? 'Modifique os campos e salve as alterações' 
                  : 'Crie um novo artigo para o blog jurídico'}
              </CardDescription>
            </div>
          </div>
          {editingArticle && (
            <Button variant="ghost" size="icon" onClick={handleCancel} title="Cancelar edição">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Título do Artigo
          </Label>
          <div className="flex gap-2">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Isenção de IR para Portadores de HIV"
              className="flex-1 bg-background"
            />
            <Button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isGenerating || !title.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar com IA
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Digite o título e clique em "Gerar com IA" para criar o conteúdo automaticamente
          </p>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-sm font-medium">
            Resumo
          </Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Breve descrição do artigo (aparece nas listagens)"
            className="bg-background min-h-[80px]"
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground text-right">
            {excerpt.length}/300 caracteres
          </p>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">
            Conteúdo (HTML)
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="<p>Conteúdo do artigo em HTML...</p>"
            className="bg-background min-h-[300px] font-mono text-sm"
          />
        </div>

        {/* Metadata Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Categoria
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Isenção Fiscal"
              className="bg-background"
            />
          </div>

          {/* Read Time */}
          <div className="space-y-2">
            <Label htmlFor="readTime" className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Tempo de Leitura
            </Label>
            <Input
              id="readTime"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              placeholder="5 min"
              className="bg-background"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Imagem de Capa
          </Label>
          
          {imageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img 
                src={imageUrl} 
                alt="Preview da imagem" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Trocar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Enviando imagem...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para enviar uma imagem
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP ou GIF (máx. 5MB)
                  </p>
                </div>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {/* Manual URL input as fallback */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">ou cole uma URL:</span>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="bg-background text-sm flex-1"
            />
          </div>
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-3">
            {published && !isScheduled ? (
              <Eye className="h-5 w-5 text-accent" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {published && !isScheduled ? 'Publicar imediatamente' : 'Salvar como rascunho'}
              </p>
              <p className="text-sm text-muted-foreground">
                {published && !isScheduled
                  ? 'O artigo ficará visível no site' 
                  : 'O artigo não será exibido no site'}
              </p>
            </div>
          </div>
          <Switch
            checked={published && !isScheduled}
            onCheckedChange={(checked) => {
              setPublished(checked);
              if (checked) {
                setIsScheduled(false);
                setScheduledAt(undefined);
              }
            }}
            disabled={isScheduled}
          />
        </div>

        {/* Schedule Toggle */}
        <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className={cn("h-5 w-5", isScheduled ? "text-accent" : "text-muted-foreground")} />
              <div>
                <p className="font-medium">Agendar publicação</p>
                <p className="text-sm text-muted-foreground">
                  Defina uma data e hora para publicar automaticamente
                </p>
              </div>
            </div>
            <Switch
              checked={isScheduled}
              onCheckedChange={(checked) => {
                setIsScheduled(checked);
                if (checked) {
                  setPublished(false);
                  if (!scheduledAt) {
                    // Default to tomorrow at 9 AM
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0);
                    setScheduledAt(tomorrow);
                  }
                }
              }}
            />
          </div>

          {isScheduled && (
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium">Data de publicação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledAt ? format(scheduledAt, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledAt}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve the time from existing scheduledAt or use 9 AM
                          const newDate = new Date(date);
                          if (scheduledAt) {
                            newDate.setHours(scheduledAt.getHours(), scheduledAt.getMinutes(), 0, 0);
                          } else {
                            newDate.setHours(9, 0, 0, 0);
                          }
                          setScheduledAt(newDate);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="w-full sm:w-32 space-y-2">
                <Label className="text-sm font-medium">Hora</Label>
                <Input
                  type="time"
                  value={scheduledAt ? format(scheduledAt, 'HH:mm') : '09:00'}
                  onChange={(e) => {
                    if (scheduledAt && e.target.value) {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const newDate = new Date(scheduledAt);
                      newDate.setHours(hours, minutes, 0, 0);
                      setScheduledAt(newDate);
                    }
                  }}
                  className="bg-background"
                />
              </div>
            </div>
          )}

          {isScheduled && scheduledAt && (
            <p className="text-sm text-accent font-medium">
              📅 O artigo será publicado em {format(scheduledAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {editingArticle && (
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Cancelar
            </Button>
          )}
          <Button
            onClick={() => setIsPreviewOpen(true)}
            disabled={!title.trim() && !content.trim()}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <MonitorPlay className="h-4 w-4" />
            Pré-visualizar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !excerpt.trim() || !content.trim()}
            className={`bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 ${editingArticle ? 'flex-1' : 'flex-1'}`}
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {editingArticle 
                  ? 'Salvar Alterações' 
                  : (published ? 'Publicar Artigo' : 'Salvar Rascunho')}
              </>
            )}
          </Button>
        </div>

        {/* Preview Modal */}
        <ArticlePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={title}
          excerpt={excerpt}
          content={content}
          category={category}
          imageUrl={imageUrl}
          readTime={readTime}
        />
      </CardContent>
    </Card>
  );
}
