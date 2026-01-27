import { useState } from "react";
import { z } from "zod";
import { Download, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  phone: z.string().trim().min(10, "Telefone inválido").max(20, "Telefone muito longo")
    .regex(/^[\d\s\-()+ ]+$/, "Telefone deve conter apenas números"),
});

interface EbookLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebookId: string;
  ebookTitle: string;
  ebookPdfPath: string;
  ebookDownloadName: string;
}

export const EbookLeadModal = ({
  isOpen,
  onClose,
  ebookId,
  ebookTitle,
  ebookPdfPath,
  ebookDownloadName,
}: EbookLeadModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation first
    const result = leadSchema.safeParse({ name, phone });
    if (!result.success) {
      const fieldErrors: { name?: string; phone?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "name") fieldErrors.name = err.message;
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

      // Trigger download
      const link = document.createElement("a");
      link.href = ebookPdfPath;
      link.download = ebookDownloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download iniciado!",
        description: "Obrigado pelo seu interesse. O e-book está sendo baixado.",
      });

      // Reset form and close modal
      setName("");
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="bg-primary p-6 text-primary-foreground">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <Download className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-bold font-heading">Download Gratuito</h2>
                    <p className="text-sm text-primary-foreground/80">
                      Preencha seus dados para baixar
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  <strong className="text-foreground">{ebookTitle}</strong>
                </p>

                <div className="space-y-2">
                  <Label htmlFor="lead-name">Nome completo</Label>
                  <Input
                    id="lead-name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? "border-destructive" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead-phone">Telefone (WhatsApp)</Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={errors.phone ? "border-destructive" : ""}
                    disabled={isSubmitting}
                    maxLength={16}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
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
                  Seus dados estão seguros e não serão compartilhados.
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};