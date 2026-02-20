import { Linkedin, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { nativeShareWithImage } from "@/lib/nativeShare";
import { useInstagramShare } from "@/hooks/useInstagramShare";

interface SocialShareButtonsProps {
  url: string;
  title: string;
  imageUrl?: string;
  className?: string;
}

export const SocialShareButtons = ({ url, title, imageUrl, className }: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { shareToStories, isSharing } = useInstagramShare();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
  };

  const handleShare = (platform: 'whatsapp' | 'x') => {
    window.open(shareLinks[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleLinkedInShare = async () => {
    const result = await nativeShareWithImage(title, url, imageUrl, 'https://www.linkedin.com/feed/');
    if (result.method === 'fallback' && result.success) {
      toast({
        title: "Link copiado!",
        description: "Abrindo LinkedIn... Cole o link no seu post.",
        duration: 5000,
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleInstagramShare = async () => {
    if (!imageUrl) return;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/proxy-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
        },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (!response.ok) throw new Error('Falha ao buscar imagem');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `artigo-${Date.now()}.jpg`;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      await navigator.clipboard.writeText(url).catch(() => {});

      toast({
        title: "Imagem baixada!",
        description: "Link copiado para a área de transferência. Abra o Instagram e compartilhe.",
        duration: 5000,
      });

      setTimeout(() => {
        window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
      }, 500);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleInstagramStoriesShare = async () => {
    if (!imageUrl) return;
    const result = await shareToStories(title, imageUrl, url);
    if (result.method === 'fallback' && result.success) {
      toast({
        title: "Imagem do Story baixada!",
        description: "Abra o Instagram e use a imagem nos seus Stories. O link foi copiado!",
        duration: 5000,
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm font-medium text-muted-foreground mr-2">Compartilhar:</span>
      
      {/* WhatsApp */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('whatsapp')}
        className="h-9 w-9 rounded-full bg-[#25D366]/10 border-[#25D366]/30 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all"
        title="Compartilhar no WhatsApp"
      >
        <svg 
          viewBox="0 0 24 24" 
          className="h-4 w-4 fill-current"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </Button>

      {/* Instagram Feed */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleInstagramShare}
        className="h-9 w-9 rounded-full bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10 border-[#E1306C]/30 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white hover:border-[#E1306C] transition-all"
        title="Compartilhar no Instagram"
      >
        <svg 
          viewBox="0 0 24 24" 
          className="h-4 w-4 fill-current"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </Button>

      {/* Instagram Stories */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleInstagramStoriesShare}
        disabled={isSharing}
        className="h-9 w-9 rounded-full bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10 border-[#E1306C]/30 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white hover:border-[#E1306C] transition-all disabled:opacity-50"
        title={isSharing ? "Gerando Story..." : "Compartilhar nos Stories"}
      >
        {isSharing ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm0 1c-4.962 0-9 4.038-9 9s4.038 9 9 9 9-4.038 9-9-4.038-9-9-9zm0 2c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7z"/>
          </svg>
        )}
      </Button>

      {/* X (Twitter) */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('x')}
        className="h-9 w-9 rounded-full bg-black/10 border-black/30 hover:bg-black hover:text-white hover:border-black transition-all dark:bg-white/10 dark:border-white/30 dark:hover:bg-white dark:hover:text-black dark:hover:border-white"
        title="Compartilhar no X"
      >
        <svg 
          viewBox="0 0 24 24" 
          className="h-4 w-4 fill-current"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </Button>

      {/* LinkedIn */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleLinkedInShare}
        className="h-9 w-9 rounded-full bg-[#0A66C2]/10 border-[#0A66C2]/30 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all"
        title="Compartilhar no LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      {/* Copy Link */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopyLink}
        className={cn(
          "h-9 w-9 rounded-full transition-all",
          copied 
            ? "bg-green-500/20 border-green-500/50 text-green-600" 
            : "bg-muted/50 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
        )}
        title="Copiar link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </Button>
    </div>
  );
};
