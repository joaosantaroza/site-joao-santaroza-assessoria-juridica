import { useState } from "react";
import { z } from "zod";
import { Download, X, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().trim().min(10, "Telefone inválido").max(20, "Telefone muito longo")
    .regex(/^[\d\s\-()+ ]+$/, "Telefone deve conter apenas números"),
});

interface ArticleEbookLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebookId: string;
  ebookTitle: string;
  ebookPdfUrl: string;
  ebookCoverUrl: string;
}

export const ArticleEbookLeadModal = ({
  isOpen,
  onClose,
  ebookId,
  ebookTitle,
  ebookPdfUrl,
  ebookCoverUrl,
}: ArticleEbookLeadModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation first
    const result = leadSchema.safeParse({ name, email, phone });
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; phone?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "name") fieldErrors.name = err.message;
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "phone") fieldErrors.phone = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit lead via Edge Function (with rate limiting and server-side validation)
      const { data, error } = await supabase.functions.invoke("submit-ebook-lead", {
        body: {
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          ebook_id: ebookId,
          ebook_title: ebookTitle,
        },
      });

      if (error) {
        // Check for rate limit error
        if (error.message?.includes("429") || data?.error?.includes("solicitações")) {
          toast({
            title: "Limite atingido",
            description: "Você já baixou muitos e-books recentemente. Tente novamente mais tarde.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      // Check for error in response body
      if (data?.error) {
        throw new Error(data.error);
      }

      // Use signed URL if available, otherwise fallback to direct URL
      const downloadUrl = data?.signed_url || ebookPdfUrl;

      // Trigger download from Supabase Storage using signed URL
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${ebookTitle.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download iniciado!",
        description: "Obrigado pelo seu interesse. O e-book está sendo baixado.",
      });

      // Reset form and close modal
      setName("");
      setEmail("");
      setPhone("");
      onClose();
    } catch (error) {
      console.error("Error saving lead:", error);
      toast({
        title: "Erro ao processar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhone = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format as (XX) XXXXX-XXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl px-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-primary rounded-2xl shadow-2xl border border-accent/20 overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary-foreground/10 transition-colors z-10"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-primary-foreground" />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Left side - eBook Cover */}
                <div className="md:w-2/5 p-6 flex items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                  <div className="text-center">
                    <img 
                      src={ebookCoverUrl} 
                      alt={ebookTitle}
                      className="w-full max-w-[180px] mx-auto rounded-lg shadow-xl border border-accent/20 mb-4"
                    />
                    <h3 className="text-lg font-bold text-primary-foreground font-heading">
                      {ebookTitle}
                    </h3>
                  </div>
                </div>

                {/* Right side - Form */}
                <div className="md:w-3/5 p-6 bg-card">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-accent" />
                    <span className="text-xs font-bold uppercase tracking-wider text-accent">
                      E-book Gratuito
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-primary font-heading mb-2">
                    Baixe Agora
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Preencha seus dados para receber o e-book gratuitamente.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lead-name">Nome</Label>
                      <Input
                        id="lead-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`bg-background ${errors.name ? "border-destructive" : ""}`}
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lead-email">Email</Label>
                      <Input
                        id="lead-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`bg-background ${errors.email ? "border-destructive" : ""}`}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lead-phone">WhatsApp</Label>
                      <Input
                        id="lead-phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={phone}
                        onChange={handlePhoneChange}
                        className={`bg-background ${errors.phone ? "border-destructive" : ""}`}
                        disabled={isSubmitting}
                        maxLength={16}
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Baixar E-book Grátis
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      🔒 Seus dados estão seguros e não serão compartilhados.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
