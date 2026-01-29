import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
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
  Pencil
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
        published,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              URL da Imagem
            </Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
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

        {/* Publish Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-3">
            {published ? (
              <Eye className="h-5 w-5 text-accent" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {published ? 'Publicar imediatamente' : 'Salvar como rascunho'}
              </p>
              <p className="text-sm text-muted-foreground">
                {published 
                  ? 'O artigo ficará visível no site' 
                  : 'O artigo não será exibido no site'}
              </p>
            </div>
          </div>
          <Switch
            checked={published}
            onCheckedChange={setPublished}
          />
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
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !excerpt.trim() || !content.trim()}
            className={`bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 ${editingArticle ? 'flex-1' : 'w-full'}`}
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
      </CardContent>
    </Card>
  );
}
