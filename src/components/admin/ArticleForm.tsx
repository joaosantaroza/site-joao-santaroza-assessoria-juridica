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
import { calculateReadingTime, getWordCount } from '@/lib/readingTime';
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
  CalendarIcon,
  BookOpen,
  FileDown,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { TagInput } from '@/components/ui/tag-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface BlogPostEdit {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string[];
  image_url: string | null;
  read_time: string;
  published: boolean;
  scheduled_at?: string | null;
  has_ebook?: boolean;
  ebook_title?: string | null;
  ebook_subtitle?: string | null;
  ebook_pdf_url?: string | null;
  ebook_cover_url?: string | null;
}

interface ArticleFormProps {
  onSuccess?: () => void;
  editingArticle?: BlogPostEdit | null;
  onCancelEdit?: () => void;
}

type ArticleTone = 'formal' | 'acessivel' | 'tecnico';

const TONE_OPTIONS: { value: ArticleTone; label: string; description: string; tooltip: string }[] = [
  { value: 'formal', label: 'Formal', description: 'Tom profissional e elegante', tooltip: 'Linguagem clara e profissional, sem ser rebuscada. Ideal para conteúdo institucional.' },
  { value: 'acessivel', label: 'Acessível', description: 'Fácil compreensão para leigos', tooltip: 'Linguagem simples e direta, como uma conversa. Perfeito para o público geral.' },
  { value: 'tecnico', label: 'Técnico', description: 'Mais detalhado e explicativo', tooltip: 'Conteúdo mais aprofundado, explicando os "porquês" das regras. Para leitores que querem entender melhor.' },
];

export function ArticleForm({ onSuccess, editingArticle, onCancelEdit }: ArticleFormProps) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string[]>(['Isenção Fiscal']);
  const [imageUrl, setImageUrl] = useState('');
  const [readTime, setReadTime] = useState('5 min');
  const [published, setPublished] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFormattingPdf, setIsFormattingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [articleTone, setArticleTone] = useState<ArticleTone>('acessivel');
  const [includeLegalBasis, setIncludeLegalBasis] = useState(true);
  
  // PDF import state
  const [pdfSourceText, setPdfSourceText] = useState('');
  const [isPdfMode, setIsPdfMode] = useState(false);
  
  // eBook fields
  const [hasEbook, setHasEbook] = useState(false);
  const [ebookTitle, setEbookTitle] = useState('');
  const [ebookSubtitle, setEbookSubtitle] = useState('');
  const [ebookPdfUrl, setEbookPdfUrl] = useState('');
  const [ebookCoverUrl, setEbookCoverUrl] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfSourceInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Populate form when editing
  useEffect(() => {
    if (editingArticle) {
      setTitle(editingArticle.title);
      setExcerpt(editingArticle.excerpt);
      setContent(editingArticle.content);
      setCategory(editingArticle.category || ['Geral']);
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
      // eBook fields
      setHasEbook(editingArticle.has_ebook || false);
      setEbookTitle(editingArticle.ebook_title || '');
      setEbookSubtitle(editingArticle.ebook_subtitle || '');
      setEbookPdfUrl(editingArticle.ebook_pdf_url || '');
      setEbookCoverUrl(editingArticle.ebook_cover_url || '');
    } else {
      resetForm();
    }
  }, [editingArticle]);

  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory(['Isenção Fiscal']);
    setImageUrl('');
    setReadTime('5 min');
    setPublished(false);
    setScheduledAt(undefined);
    setIsScheduled(false);
    // Reset PDF import state
    setPdfSourceText('');
    setIsPdfMode(false);
    // Reset eBook fields
    setHasEbook(false);
    setEbookTitle('');
    setEbookSubtitle('');
    setEbookPdfUrl('');
    setEbookCoverUrl('');
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

  // Handle PDF upload for eBook
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Formato inválido',
        description: 'Use apenas arquivos PDF.',
        variant: 'destructive'
      });
      return;
    }

    // Max 20MB for PDF
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo para PDF é 20MB.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploadingPdf(true);

    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.pdf`;
      const filePath = `pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ebooks')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ebooks')
        .getPublicUrl(filePath);

      setEbookPdfUrl(publicUrl);

      toast({
        title: 'PDF enviado!',
        description: 'O arquivo PDF foi carregado com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Não foi possível enviar o PDF.',
        variant: 'destructive'
      });
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // Handle cover image upload for eBook
  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Use imagens JPG, PNG ou WebP.',
        variant: 'destructive'
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 5MB.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      // Upload covers to blog-images bucket (public) instead of ebooks bucket (private)
      const filePath = `ebook-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setEbookCoverUrl(publicUrl);

      toast({
        title: 'Capa enviada!',
        description: 'A imagem da capa foi carregada com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Não foi possível enviar a capa.',
        variant: 'destructive'
      });
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
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
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-article`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ title: title.trim(), tone: articleTone, includeLegalBasis }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar conteúdo');
      }

      if (data.success && data.data) {
        setContent(data.data.content);
        setExcerpt(data.data.excerpt);
        setCategory(data.data.category ? [data.data.category] : category);
        // Auto-calculate reading time from generated content
        setReadTime(calculateReadingTime(data.data.content));

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

  // Handle PDF file upload for text extraction
  const handlePdfSourceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Formato inválido',
        description: 'Use apenas arquivos PDF.',
        variant: 'destructive'
      });
      return;
    }

    // Max 10MB for PDF processing
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo para processamento é 10MB.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Use pdf.js to extract text from PDF
      const arrayBuffer = await file.arrayBuffer();
      
      // Dynamic import of pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      if (fullText.trim().length < 100) {
        toast({
          title: 'PDF com pouco conteúdo',
          description: 'O PDF parece estar vazio ou com muito pouco texto.',
          variant: 'destructive'
        });
        return;
      }

      setPdfSourceText(fullText.trim());
      setIsPdfMode(true);
      
      toast({
        title: 'PDF carregado!',
        description: `${pdf.numPages} página(s) extraída(s). Agora clique em "Formatar com IA" para adaptar o conteúdo.`,
      });
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      toast({
        title: 'Erro ao processar PDF',
        description: 'Não foi possível extrair o texto do PDF. Verifique se o arquivo não está protegido.',
        variant: 'destructive'
      });
    } finally {
      if (pdfSourceInputRef.current) pdfSourceInputRef.current.value = '';
    }
  };

  // Format PDF content with AI
  const handleFormatPdfWithAI = async () => {
    if (!title || title.trim().length < 5) {
      toast({
        title: 'Título necessário',
        description: 'Digite um título com pelo menos 5 caracteres.',
        variant: 'destructive'
      });
      return;
    }

    if (!pdfSourceText || pdfSourceText.length < 100) {
      toast({
        title: 'PDF necessário',
        description: 'Carregue um PDF primeiro para formatar o conteúdo.',
        variant: 'destructive'
      });
      return;
    }

    setIsFormattingPdf(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/format-pdf-article`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            pdfText: pdfSourceText, 
            title: title.trim(), 
            tone: articleTone 
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao formatar conteúdo');
      }

      if (data.success && data.data) {
        setContent(data.data.content);
        setExcerpt(data.data.excerpt);
        setCategory(data.data.category ? [data.data.category] : category);
        setReadTime(calculateReadingTime(data.data.content));

        toast({
          title: 'Conteúdo formatado!',
          description: 'O PDF foi formatado no estilo do blog. Revise antes de publicar.',
        });
      }
    } catch (error) {
      console.error('Error formatting PDF article:', error);
      toast({
        title: 'Erro na formatação',
        description: error instanceof Error ? error.message : 'Não foi possível formatar o conteúdo.',
        variant: 'destructive'
      });
    } finally {
      setIsFormattingPdf(false);
    }
  };

  // Clear PDF mode
  const handleClearPdfMode = () => {
    setPdfSourceText('');
    setIsPdfMode(false);
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

    // Validate eBook fields if enabled
    if (hasEbook) {
      if (!ebookTitle.trim()) {
        toast({ title: 'Título do eBook obrigatório', variant: 'destructive' });
        return;
      }
      if (!ebookPdfUrl.trim()) {
        toast({ title: 'PDF do eBook obrigatório', variant: 'destructive' });
        return;
      }
      if (!ebookCoverUrl.trim()) {
        toast({ title: 'Capa do eBook obrigatória', variant: 'destructive' });
        return;
      }
    }

    setIsSaving(true);

    try {
      const slug = generateSlug(title);
      const postData = {
        title: title.trim(),
        slug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        category: category.length > 0 ? category : ['Geral'],
        image_url: imageUrl.trim() || null,
        read_time: readTime.trim(),
        published: isScheduled ? true : published,
        scheduled_at: isScheduled && scheduledAt ? scheduledAt.toISOString() : null,
        has_ebook: hasEbook,
        ebook_title: hasEbook ? ebookTitle.trim() : null,
        ebook_subtitle: hasEbook ? ebookSubtitle.trim() : null,
        ebook_pdf_url: hasEbook ? ebookPdfUrl.trim() : null,
        ebook_cover_url: hasEbook ? ebookCoverUrl.trim() : null,
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
            {!isPdfMode ? (
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
            ) : (
              <Button
                type="button"
                onClick={handleFormatPdfWithAI}
                disabled={isFormattingPdf || !title.trim() || !pdfSourceText}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2"
              >
                {isFormattingPdf ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Formatando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Formatar com IA
                  </>
                )}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isPdfMode 
              ? 'PDF carregado! Digite o título e clique em "Formatar com IA" para adaptar o conteúdo'
              : 'Digite o título e clique em "Gerar com IA" para criar o conteúdo automaticamente'
            }
          </p>
          
          {/* AI Generation Options */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50 mt-3">
            {/* Tone Selector */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground mr-1">Tom:</span>
              <TooltipProvider>
                {TONE_OPTIONS.map((option) => (
                  <Tooltip key={option.value}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setArticleTone(option.value)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-full border transition-all",
                          articleTone === option.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50"
                        )}
                      >
                        {option.label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">
                      <p className="text-xs">{option.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
            
            {/* Legal Basis Toggle - only show when not in PDF mode */}
            {!isPdfMode && (
              <div className="flex items-center gap-2 pl-4 border-l border-border/50">
                <Switch
                  id="include-legal-basis"
                  checked={includeLegalBasis}
                  onCheckedChange={setIncludeLegalBasis}
                />
                <Label 
                  htmlFor="include-legal-basis" 
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Incluir bases legais
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[280px] text-center">
                      <p className="text-xs">
                        <strong>Ativado:</strong> O artigo mencionará leis e artigos específicos de forma natural no texto.
                      </p>
                      <p className="text-xs mt-1">
                        <strong>Desativado:</strong> O artigo será 100% prático, sem citar números de leis ou artigos.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            
            {/* PDF Import Option */}
            <div className="flex items-center gap-2 pl-4 border-l border-border/50">
              {isPdfMode ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-accent font-medium flex items-center gap-1">
                    <FileDown className="h-3.5 w-3.5" />
                    PDF carregado ({Math.round(pdfSourceText.length / 1000)}k caracteres)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearPdfMode}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => pdfSourceInputRef.current?.click()}
                    className="h-7 text-xs gap-1.5"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    Importar PDF
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[280px] text-center">
                        <p className="text-xs">
                          Carregue um PDF e a IA irá reformatar o conteúdo para ficar consistente com o estilo dos artigos do blog.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
              <input
                ref={pdfSourceInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfSourceUpload}
                className="hidden"
              />
            </div>
          </div>
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

        {/* Categories */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Categorias
          </Label>
          <TagInput
            value={category}
            onChange={setCategory}
            placeholder="Adicionar categoria..."
            maxTags={5}
          />
        </div>

        {/* Read Time */}
        <div className="space-y-2 max-w-md">
          <Label htmlFor="readTime" className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Tempo de Leitura
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="readTime"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              placeholder="5 min"
              className="bg-background flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReadTime(calculateReadingTime(content))}
              disabled={!content.trim()}
              title="Calcular automaticamente"
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Calcular
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {content.trim() ? (
              <>
                {getWordCount(content).toLocaleString('pt-BR')} palavras • 
                Tempo estimado: {calculateReadingTime(content)}
              </>
            ) : (
              'Digite o conteúdo para calcular automaticamente'
            )}
          </p>
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

        {/* eBook Section */}
        <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className={cn("h-5 w-5", hasEbook ? "text-accent" : "text-muted-foreground")} />
              <div>
                <p className="font-medium">Oferecer eBook neste artigo?</p>
                <p className="text-sm text-muted-foreground">
                  Capture leads oferecendo um eBook gratuito
                </p>
              </div>
            </div>
            <Switch
              checked={hasEbook}
              onCheckedChange={setHasEbook}
            />
          </div>

          {hasEbook && (
            <div className="space-y-4 pt-4 border-t border-border">
              {/* eBook Title */}
              <div className="space-y-2">
                <Label htmlFor="ebookTitle" className="text-sm font-medium">
                  Título do eBook
                </Label>
                <Input
                  id="ebookTitle"
                  value={ebookTitle}
                  onChange={(e) => setEbookTitle(e.target.value)}
                  placeholder="Ex: Guia Completo de Isenção de IR"
                  className="bg-background"
                />
              </div>

              {/* eBook Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="ebookSubtitle" className="text-sm font-medium">
                  Subtítulo (Chamada para ação)
                </Label>
                <Textarea
                  id="ebookSubtitle"
                  value={ebookSubtitle}
                  onChange={(e) => setEbookSubtitle(e.target.value)}
                  placeholder="Baixe nosso guia completo e descubra como garantir seus direitos..."
                  className="bg-background min-h-[60px]"
                  maxLength={200}
                />
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileDown className="h-4 w-4 text-muted-foreground" />
                  Arquivo PDF do eBook
                </Label>
                {ebookPdfUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                    <FileDown className="h-8 w-8 text-accent" />
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium truncate">PDF carregado</p>
                      <p className="text-xs text-muted-foreground truncate">{ebookPdfUrl}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isUploadingPdf}
                    >
                      {isUploadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Trocar'}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setEbookPdfUrl('')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent/50 transition-colors"
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    {isUploadingPdf ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Enviando PDF...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileDown className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Clique para enviar o PDF
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Apenas PDF (máx. 20MB)
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  Imagem da Capa (3D ou plana)
                </Label>
                {ebookCoverUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-border w-fit">
                    <img 
                      src={ebookCoverUrl} 
                      alt="Capa do eBook" 
                      className="h-48 w-auto object-contain bg-muted"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={isUploadingCover}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Trocar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setEbookCoverUrl('')}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent/50 transition-colors w-fit min-w-[200px]"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {isUploadingCover ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Enviando capa...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Clique para enviar a capa
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG ou WebP (máx. 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
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
          category={category.join(', ')}
          imageUrl={imageUrl}
          readTime={readTime}
        />
      </CardContent>
    </Card>
  );
}
