import { useState } from "react";
import { z } from "zod";
import { Download, X, Loader2, BookOpen, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const step1Schema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
});

const step2Schema = z.object({
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
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setStep(1);
    setErrors({});
    onClose();
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = step1Schema.safeParse({ name, email });
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "name") fieldErrors.name = err.message;
        if (err.path[0] === "email") fieldErrors.email = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = step2Schema.safeParse({ phone });
    if (!result.success) {
      const fieldErrors: { phone?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "phone") fieldErrors.phone = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("submit-ebook-lead", {
        body: {
          name: name.trim(),
          email: email.trim(),
          phone: result.data.phone,
          ebook_id: ebookId,
          ebook_title: ebookTitle,
        },
      });

      if (error) {
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

      if (data?.error) {
        throw new Error(data.error);
      }

      const downloadUrl = data?.signed_url || ebookPdfUrl;

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

      setName("");
      setEmail("");
      setPhone("");
      setStep(1);
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
    const digits = value.replace(/\D/g, "");
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
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <div className="relative bg-card rounded-xl shadow-2xl border border-accent/20 overflow-hidden">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Header */}
                <div className="bg-primary p-4 text-center">
                  <BookOpen className="w-6 h-6 text-accent mx-auto mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    E-book Gratuito
                  </span>
                  <h2 className="text-base font-bold text-primary-foreground font-heading mt-1">
                    Baixe Agora
                  </h2>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center justify-center gap-2 py-3 bg-muted/50">
                  <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? "bg-accent" : "bg-muted-foreground/30"}`} />
                  <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? "bg-accent" : "bg-muted-foreground/30"}`} />
                </div>

                {/* Form */}
                <div className="p-4">
                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.form
                        key="step1"
                        onSubmit={handleStep1}
                        className="space-y-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="lead-name" className="text-sm">Nome</Label>
                          <Input
                            id="lead-name"
                            type="text"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`bg-background h-9 text-sm ${errors.name ? "border-destructive" : ""}`}
                            autoFocus
                          />
                          {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="lead-email" className="text-sm">Email</Label>
                          <Input
                            id="lead-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`bg-background h-9 text-sm ${errors.email ? "border-destructive" : ""}`}
                          />
                          {errors.email && (
                            <p className="text-xs text-destructive">{errors.email}</p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-9 text-sm"
                        >
                          Continuar
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="step2"
                        onSubmit={handleSubmit}
                        className="space-y-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="lead-phone" className="text-sm">WhatsApp</Label>
                          <Input
                            id="lead-phone"
                            type="tel"
                            placeholder="(00) 00000-0000"
                            value={phone}
                            onChange={handlePhoneChange}
                            className={`bg-background h-9 text-sm ${errors.phone ? "border-destructive" : ""}`}
                            maxLength={16}
                            autoFocus
                          />
                          {errors.phone && (
                            <p className="text-xs text-destructive">{errors.phone}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 text-sm px-3"
                            onClick={() => setStep(1)}
                            disabled={isSubmitting}
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-9 text-sm"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Baixar
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <p className="text-[10px] text-center text-muted-foreground mt-3">
                    🔒 Seus dados estão seguros.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
