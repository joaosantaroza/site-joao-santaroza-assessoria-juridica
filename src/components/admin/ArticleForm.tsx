import { useState, useEffect, useRef, useMemo } from 'react';
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
import { TrendingResearch } from './TrendingResearch';
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
  HelpCircle,
  TrendingUp,
  Target,
  MapPin
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
  
  // Custom instructions state
  const [useCustomInstructions, setUseCustomInstructions] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  
  // PDF import state
  const [pdfSourceText, setPdfSourceText] = useState('');
  const [isPdfMode, setIsPdfMode] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  
  // SEO Mode from Trending Research
  const [isSeoMode, setIsSeoMode] = useState(false);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [showTrendingResearch, setShowTrendingResearch] = useState(false);
  const [approvedTopicTitle, setApprovedTopicTitle] = useState<string | null>(null);
  
  // Modo Maringá - Geolocalização máxima
  const [isMaringaMode, setIsMaringaMode] = useState(false);
  
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

  // Prompt examples organized by category
  const promptCategories = useMemo(() => [
    {
      id: 'previdenciario',
      label: 'Previdenciário',
      prompts: [
        { label: "Aposentadoria Especial", prompt: "Escreva um artigo sobre aposentadoria especial para trabalhadores expostos a agentes nocivos (ruído, calor, produtos químicos). Explique requisitos, como comprovar a atividade especial e diferenças para aposentadoria comum." },
        { label: "Revisão de Benefício INSS", prompt: "Escreva sobre como solicitar a revisão de benefício do INSS quando o valor está incorreto. Explique os tipos de revisão mais comuns, prazos e como o aposentado pode verificar se tem direito." },
        { label: "Pensão por Morte", prompt: "Crie um artigo explicando quem tem direito à pensão por morte do INSS, documentos necessários, valor do benefício e como solicitar. Inclua informações sobre dependentes e prazos." },
        { label: "Auxílio-Doença", prompt: "Escreva sobre como solicitar auxílio-doença no INSS, requisitos de carência, documentos médicos necessários e o que fazer se o pedido for negado." },
        { label: "BPC/LOAS", prompt: "Crie um artigo sobre o Benefício de Prestação Continuada (BPC/LOAS) para idosos e pessoas com deficiência, requisitos de renda, como solicitar e documentos necessários." },
      ]
    },
    {
      id: 'trabalhista',
      label: 'Trabalhista',
      prompts: [
        { label: "Direitos da Gestante", prompt: "Crie um artigo sobre os direitos trabalhistas da gestante, incluindo estabilidade no emprego, licença-maternidade, intervalos para amamentação e proteção contra demissão. Foque em orientações práticas." },
        { label: "Horas Extras não Pagas", prompt: "Crie um artigo orientando trabalhadores que fazem horas extras mas não recebem corretamente. Explique como calcular, documentar e cobrar as horas extras devidas do empregador." },
        { label: "Acidente de Trabalho", prompt: "Escreva sobre os direitos do trabalhador que sofre acidente de trabalho. Inclua estabilidade, benefícios do INSS, indenizações e o que fazer logo após o acidente." },
        { label: "Demissão por Justa Causa", prompt: "Crie um artigo explicando o que caracteriza demissão por justa causa, direitos do trabalhador nessa situação e como contestar uma demissão injusta." },
        { label: "FGTS Retido", prompt: "Escreva sobre situações em que o trabalhador pode sacar o FGTS, como verificar se a empresa está depositando corretamente e o que fazer se houver irregularidades." },
        { label: "Seguro-Desemprego", prompt: "Crie um artigo explicando quem tem direito ao seguro-desemprego, quantas parcelas pode receber, como solicitar e prazos importantes." },
      ]
    },
    {
      id: 'tributario',
      label: 'Tributário',
      prompts: [
        { label: "Isenção IR - Doença Grave", prompt: "Escreva um artigo explicando como pessoas com doenças graves (câncer, HIV, Parkinson, etc.) podem solicitar isenção de imposto de renda sobre aposentadoria. Inclua requisitos, documentos necessários e o passo a passo do pedido." },
        { label: "Restituição IR Indevido", prompt: "Crie um artigo sobre como solicitar restituição de imposto de renda pago indevidamente, incluindo situações comuns, prazos e documentação necessária." },
        { label: "Isenção IPTU Aposentado", prompt: "Escreva sobre isenção ou desconto de IPTU para aposentados e idosos, requisitos por município e como solicitar o benefício." },
      ]
    },
    {
      id: 'consumidor',
      label: 'Consumidor',
      prompts: [
        { label: "Compras Online", prompt: "Crie um artigo sobre os principais direitos do consumidor em compras online, incluindo direito de arrependimento, troca de produtos com defeito e como registrar reclamações." },
        { label: "Cobrança Indevida", prompt: "Escreva sobre o que fazer quando receber cobrança indevida, direito à devolução em dobro, como contestar e órgãos de proteção ao consumidor." },
        { label: "Produto com Defeito", prompt: "Crie um artigo explicando os direitos do consumidor quando o produto apresenta defeito, prazos para reclamação, opções de reparo/troca e quando pedir reembolso." },
      ]
    },
    {
      id: 'familia',
      label: 'Família',
      prompts: [
        { label: "Pensão Alimentícia", prompt: "Escreva sobre como funciona a pensão alimentícia: quem pode pedir, como calcular o valor, revisão de valores e consequências do não pagamento." },
        { label: "Guarda de Filhos", prompt: "Crie um artigo sobre os tipos de guarda (compartilhada, unilateral), como solicitar, direitos de visitação e o que considerar no melhor interesse da criança." },
        { label: "Divórcio", prompt: "Escreva sobre o processo de divórcio no Brasil, diferença entre consensual e litigioso, documentos necessários e divisão de bens." },
      ]
    },
    {
      id: 'saude',
      label: 'Saúde',
      prompts: [
        { label: "Erro Médico", prompt: "Escreva sobre responsabilidade por erro médico, quando cabe indenização, documentos para comprovar e diferença entre erro e resultado adverso." },
        { label: "Plano de Saúde", prompt: "Crie um artigo sobre os direitos do beneficiário de plano de saúde, cobertura obrigatória, negativa de procedimentos e como recorrer." },
        { label: "Medicamentos pelo SUS", prompt: "Escreva sobre como solicitar medicamentos de alto custo pelo SUS, requisitos, documentação e o que fazer em caso de negativa." },
      ]
    },
  ], []);

  const [activePromptCategory, setActivePromptCategory] = useState('previdenciario');

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
    // Reset custom instructions state
    setUseCustomInstructions(false);
    setCustomInstructions('');
    // Reset PDF import state
    setPdfSourceText('');
    setIsPdfMode(false);
    setIsPdfPreviewOpen(false);
    // Reset eBook fields
    setHasEbook(false);
    setEbookTitle('');
    setEbookSubtitle('');
    setEbookPdfUrl('');
    setEbookCoverUrl('');
    // Reset SEO mode
    setIsSeoMode(false);
    setSeoKeywords([]);
    setShowTrendingResearch(false);
    setApprovedTopicTitle(null);
    // Reset Maringá mode
    setIsMaringaMode(false);
  };

  // Handle topic selection from trending research
  const handleSelectTrendingTopic = (topic: { title: string; keywords: string[]; category: string }) => {
    setTitle(topic.title);
    setSeoKeywords(topic.keywords || []);
    setCategory([topic.category]);
    setIsSeoMode(true);
    setShowTrendingResearch(false);
    setUseCustomInstructions(false);
    setApprovedTopicTitle(topic.title); // Track approved topic for analytics linking
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
    // If using custom instructions, validate instructions instead of title
    if (useCustomInstructions) {
      if (!customInstructions || customInstructions.trim().length < 10) {
        toast({
          title: 'Instruções necessárias',
          description: 'Descreva o que você quer gerar com pelo menos 10 caracteres.',
          variant: 'destructive'
        });
        return;
      }
    } else {
      if (!title || title.trim().length < 5) {
        toast({
          title: 'Título necessário',
          description: 'Digite um título com pelo menos 5 caracteres para gerar o conteúdo.',
          variant: 'destructive'
        });
        return;
      }
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
          body: JSON.stringify({ 
            title: useCustomInstructions ? '' : title.trim(), 
            tone: articleTone, 
            includeLegalBasis,
            customInstructions: useCustomInstructions ? customInstructions.trim() : undefined,
            seoMode: isSeoMode,
            seoKeywords: isSeoMode ? seoKeywords : undefined,
            maringaMode: isMaringaMode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar conteúdo');
      }

      if (data.success && data.data) {
        setContent(data.data.content);
        setExcerpt(data.data.excerpt);
        
        // Auto-apply SEO tags generated by AI
        if (data.data.tags && Array.isArray(data.data.tags) && data.data.tags.length > 0) {
          setCategory(data.data.tags);
        } else if (data.data.category) {
          setCategory([data.data.category]);
        }
        
        // Auto-calculate reading time from generated content
        setReadTime(calculateReadingTime(data.data.content));
        
        // If using custom instructions, also set the generated title
        if (useCustomInstructions && data.data.title) {
          setTitle(data.data.title);
        }

        // Auto-apply generated cover image if available
        if (data.data.coverImageUrl) {
          setImageUrl(data.data.coverImageUrl);
        }

        const tagsGenerated = data.data.tags?.length || 0;
        const imageGenerated = data.data.coverImageUrl ? ' e imagem de capa' : '';
        toast({
          title: isSeoMode ? 'Artigo SEO gerado!' : 'Conteúdo gerado!',
          description: isSeoMode
            ? `Artigo otimizado para ranqueamento gerado com ${tagsGenerated} tags SEO${imageGenerated}. Revise antes de publicar.`
            : useCustomInstructions 
              ? `Título, artigo, ${tagsGenerated} tags SEO${imageGenerated} gerados automaticamente. Revise antes de publicar.`
              : `O artigo foi gerado com ${tagsGenerated} tags SEO${imageGenerated}. Revise antes de publicar.`,
        });
        
        // Clear SEO mode after successful generation
        if (isSeoMode) {
          setIsSeoMode(false);
          setSeoKeywords([]);
        }
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
    setIsPdfPreviewOpen(false);
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
        const { data: newArticle, error } = await supabase
          .from('blog_posts')
          .insert(postData)
          .select('id')
          .single();

        if (error) {
          if (error.code === '23505') {
            throw new Error('Já existe um artigo com este título. Escolha outro.');
          }
          throw error;
        }

        // Link article to trending topic analytics if came from SEO mode
        if (approvedTopicTitle && newArticle?.id) {
          await supabase
            .from('trending_topic_analytics')
            .update({ article_id: newArticle.id })
            .eq('topic_title', approvedTopicTitle)
            .is('article_id', null);
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
        {/* Trending Research Section */}
        {!editingArticle && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant={showTrendingResearch ? "default" : "outline"}
                onClick={() => setShowTrendingResearch(!showTrendingResearch)}
                className={cn(
                  "gap-2",
                  showTrendingResearch && "bg-amber-600 hover:bg-amber-700"
                )}
              >
                <TrendingUp className="h-4 w-4" />
                {showTrendingResearch ? 'Ocultar Pesquisa' : 'Descobrir Trending Topics'}
              </Button>
              
              {isSeoMode && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Modo SEO Ativado
                  </span>
                  {seoKeywords.length > 0 && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ({seoKeywords.length} keywords)
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setIsSeoMode(false); setSeoKeywords([]); }}
                    className="h-5 w-5 p-0 text-green-600 hover:text-green-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {showTrendingResearch && (
              <TrendingResearch onSelectTopic={handleSelectTrendingTopic} />
            )}
          </div>
        )}
        
        {/* Custom Instructions Field - shown when toggle is on and not in PDF mode */}
        {useCustomInstructions && !isPdfMode && (
          <div className="space-y-3">
            <Label htmlFor="custom-instructions" className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Descreva o que você quer gerar
            </Label>
            
            {/* Prompt Examples by Category */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Escolha uma área e clique em um exemplo:</p>
              
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-border/30">
                {promptCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActivePromptCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      activePromptCategory === cat.id
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              
              {/* Prompts for Active Category */}
              <div className="flex flex-wrap gap-2">
                {promptCategories
                  .find(cat => cat.id === activePromptCategory)
                  ?.prompts.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => setCustomInstructions(example.prompt)}
                      className="px-3 py-1.5 text-xs rounded-full border border-border/50 bg-muted/30 hover:bg-accent/20 hover:border-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {example.label}
                    </button>
                  ))}
              </div>
            </div>
            
            <Textarea
              id="custom-instructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Ex: Escreva um artigo sobre isenção de imposto de renda para aposentados com câncer, explicando os requisitos, documentos necessários e como solicitar a isenção..."
              className="bg-background min-h-[100px]"
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Personalize as instruções conforme necessário. A IA irá gerar o título e o conteúdo completo.
              </p>
              <span className="text-xs text-muted-foreground">
                {customInstructions.length}/1000
              </span>
            </div>
            <Button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isGenerating || customInstructions.trim().length < 10}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando título e artigo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar Título + Artigo com IA
                </>
              )}
            </Button>
          </div>
        )}
        
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Título do Artigo
            {useCustomInstructions && !isPdfMode && (
              <span className="text-xs text-muted-foreground ml-2">(será gerado automaticamente)</span>
            )}
          </Label>
          <div className="flex gap-2">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={useCustomInstructions && !isPdfMode ? "Será preenchido pela IA..." : "Ex: Isenção de IR para Portadores de HIV"}
              className="flex-1 bg-background"
              disabled={useCustomInstructions && !isPdfMode && isGenerating}
            />
            {!isPdfMode && !useCustomInstructions ? (
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
            ) : isPdfMode ? (
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
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {isPdfMode 
              ? 'PDF carregado! Digite o título e clique em "Formatar com IA" para adaptar o conteúdo'
              : useCustomInstructions
              ? 'O título será gerado automaticamente pela IA com base nas suas instruções'
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
            
            {/* Modo Maringá Toggle - only show when not in PDF mode */}
            {!isPdfMode && (
              <div className="flex items-center gap-2 pl-4 border-l border-border/50">
                <Switch
                  id="maringa-mode"
                  checked={isMaringaMode}
                  onCheckedChange={setIsMaringaMode}
                />
                <Label 
                  htmlFor="maringa-mode" 
                  className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1"
                >
                  <MapPin className="h-3 w-3" />
                  Modo Maringá
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[320px] text-center">
                      <p className="text-xs font-semibold mb-1">Geolocalização Máxima</p>
                      <p className="text-xs">
                        <strong>Ativado:</strong> Força menções a Maringá, Sarandi, Paiçandu, Marialva e Norte do Paraná no artigo para otimização de SEO Local.
                      </p>
                      <p className="text-xs mt-1">
                        <strong>Desativado:</strong> Artigo genérico para todo o Brasil.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            
            {/* Custom Instructions Toggle - only show when not in PDF mode */}
            {!isPdfMode && (
              <div className="flex items-center gap-2 pl-4 border-l border-border/50">
                <Switch
                  id="use-custom-instructions"
                  checked={useCustomInstructions}
                  onCheckedChange={setUseCustomInstructions}
                />
                <Label 
                  htmlFor="use-custom-instructions" 
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Gerar título + artigo
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[280px] text-center">
                      <p className="text-xs">
                        <strong>Ativado:</strong> Descreva o que você quer e a IA irá gerar tanto o título quanto o artigo completo.
                      </p>
                      <p className="text-xs mt-1">
                        <strong>Desativado:</strong> Você define o título e a IA gera apenas o conteúdo do artigo.
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
                    onClick={() => setIsPdfPreviewOpen(!isPdfPreviewOpen)}
                    className="h-6 px-2 text-xs"
                    title="Visualizar texto extraído"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {isPdfPreviewOpen ? 'Ocultar' : 'Ver texto'}
                  </Button>
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
          
          {/* PDF Text Preview */}
          {isPdfMode && isPdfPreviewOpen && (
            <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Texto Extraído do PDF
                </Label>
                <span className="text-xs text-muted-foreground">
                  {pdfSourceText.split(/\s+/).filter(Boolean).length.toLocaleString('pt-BR')} palavras
                </span>
              </div>
              <div className="relative">
                <pre className="bg-background p-3 rounded-md text-xs text-muted-foreground overflow-y-auto max-h-[300px] whitespace-pre-wrap font-mono border border-border/50">
                  {pdfSourceText}
                </pre>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none rounded-b-md" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Revise o texto acima. Se estiver correto, digite o título e clique em "Formatar com IA".
              </p>
            </div>
          )}
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
