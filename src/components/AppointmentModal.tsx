import { useState } from "react";
import { X, CalendarIcon, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CONTACT_INFO, SERVICES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format, isWeekend, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

const formSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().trim().min(10, "Telefone inválido").regex(/^[\d\s\-()+ ]+$/, "Formato inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  practice_area: z.string().min(1, "Selecione uma área"),
  preferred_date: z.date({ required_error: "Selecione uma data" }),
  preferred_time: z.string().min(1, "Selecione um horário"),
  message: z.string().max(1000).optional(),
});

export const AppointmentModal = ({ isOpen, onClose }: AppointmentModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  if (!isOpen) return null;

  const resetForm = () => {
    setName(""); setPhone(""); setEmail(""); setPracticeArea("");
    setDate(undefined); setTime(""); setMessage("");
    setErrors({}); setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse({
      name, phone, email: email || undefined, practice_area: practiceArea,
      preferred_date: date, preferred_time: time, message,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-appointment", {
        body: {
          name, phone, email: email || undefined, practice_area: practiceArea,
          preferred_date: format(date!, "yyyy-MM-dd"), preferred_time: time,
          message: message || undefined,
        },
      });

      if (error || data?.error) {
        toast({
          title: "Erro ao agendar",
          description: data?.error || "Tente novamente em alguns minutos.",
          variant: "destructive",
        });
      } else {
        setIsSuccess(true);
      }
    } catch {
      toast({ title: "Erro", description: "Falha na conexão.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleWhatsAppConfirm = () => {
    const text = `Olá, Dr. João Victor! Acabei de agendar pelo site.\n\n*Nome:* ${name}\n*Área:* ${practiceArea}\n*Data:* ${date ? format(date, "dd/MM/yyyy") : ""}\n*Horário:* ${time}\n${message ? `*Mensagem:* ${message}` : ""}`;
    window.open(`https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
    handleClose();
  };

  const disabledDays = (day: Date) => isWeekend(day) || isBefore(day, startOfDay(new Date()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-xl p-8 max-w-lg w-full shadow-2xl relative border-t-4 border-accent max-h-[90vh] overflow-y-auto"
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors">
          <X className="w-6 h-6" />
        </button>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-extrabold mb-2 text-primary font-heading">Agendamento Confirmado!</h3>
              <p className="text-muted-foreground mb-2">
                {date && format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {time}
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Entraremos em contato para confirmar o atendimento.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleWhatsAppConfirm} className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                  Confirmar via WhatsApp
                </Button>
                <Button onClick={handleClose} variant="outline" className="w-full">
                  Fechar
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-extrabold mb-2 text-primary font-heading">Agendar Consulta</h3>
                <p className="text-sm text-muted-foreground">Escolha o melhor dia e horário para seu atendimento.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Nome Completo *</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" className="bg-secondary" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">WhatsApp *</label>
                  <Input value={phone} onChange={e => setPhone(formatPhoneInput(e.target.value))} placeholder="(00) 00000-0000" className="bg-secondary" />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">E-mail (opcional)</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="bg-secondary" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Área de Interesse *</label>
                  <Select value={practiceArea} onValueChange={setPracticeArea}>
                    <SelectTrigger className="bg-secondary">
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SERVICES).map(s => (
                        <SelectItem key={s.id} value={s.title}>{s.title}</SelectItem>
                      ))}
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.practice_area && <p className="text-xs text-destructive mt-1">{errors.practice_area}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Data *</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-secondary", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={disabledDays}
                          locale={ptBR}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.preferred_date && <p className="text-xs text-destructive mt-1">{errors.preferred_date}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Horário *</label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.preferred_time && <p className="text-xs text-destructive mt-1">{errors.preferred_time}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Mensagem (opcional)</label>
                  <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Breve relato do seu caso..." className="bg-secondary h-20 resize-none" />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : "Confirmar Agendamento"}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
