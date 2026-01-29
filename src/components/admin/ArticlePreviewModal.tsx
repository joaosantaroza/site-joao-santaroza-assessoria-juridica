import { Calendar, Clock, User, X } from "lucide-react";
import DOMPurify from "dompurify";
import { CONTACT_INFO } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArticlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  readTime: string;
}

export function ArticlePreviewModal({
  isOpen,
  onClose,
  title,
  excerpt,
  content,
  category,
  imageUrl,
  readTime,
}: ArticlePreviewModalProps) {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-heading text-lg">
              Pré-visualização do Artigo
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="bg-background">
            {/* Hero Image */}
            {imageUrl ? (
              <div className="relative h-48 md:h-64">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              </div>
            ) : (
              <div className="h-48 md:h-64 bg-muted flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Sem imagem de capa</p>
              </div>
            )}

            {/* Article Content */}
            <article className="p-6 md:p-10 -mt-16 relative z-10">
              <div className="max-w-3xl mx-auto">
                {/* Category Badge */}
                <span className="inline-block px-4 py-2 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                  {category || 'Sem categoria'}
                </span>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary font-heading mb-6 leading-tight">
                  {title || 'Título do Artigo'}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {CONTACT_INFO.lawyerName}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {today}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {readTime || '5 min'} de leitura
                  </span>
                </div>

                {/* Excerpt */}
                {excerpt && (
                  <p className="text-lg text-muted-foreground mb-8 italic border-l-4 border-accent pl-4">
                    {excerpt}
                  </p>
                )}

                {/* Article Body */}
                {content ? (
                  <div
                    className="article-content prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum conteúdo para exibir
                  </p>
                )}

                {/* Author Box Preview */}
                <div className="mt-12 p-6 bg-secondary rounded-xl flex flex-col md:flex-row items-center gap-6">
                  <img
                    src={CONTACT_INFO.lawyerPhoto}
                    alt={CONTACT_INFO.lawyerName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="text-center md:text-left">
                    <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
                      Autor
                    </p>
                    <h4 className="font-bold text-primary font-heading">
                      {CONTACT_INFO.lawyerName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {CONTACT_INFO.oab} • Especialista em Direito Tributário e Trabalhista
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
