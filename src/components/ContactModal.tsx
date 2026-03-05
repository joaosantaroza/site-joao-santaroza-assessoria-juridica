import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_INFO } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
}

export const ContactModal = ({ isOpen, onClose, initialSubject = '' }: ContactModalProps) => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isOpen) return null;

  const openWhatsApp = () => {
    const text = `Olá, Dr. João Victor. \n\nMeu nome é *${formData.name}*.\nTelefone: ${formData.phone}\n\n*Assunto:* ${initialSubject || 'Consulta Jurídica'}\n*Mensagem:* ${formData.message}`;
    window.open(`https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await supabase.functions.invoke('submit-contact', {
        body: {
          name: formData.name,
          phone: formData.phone,
          message: formData.message,
          subject: initialSubject || 'Consulta Jurídica',
        },
      });
    } catch (err) {
      console.error('Erro ao salvar contato:', err);
    }

    openWhatsApp();
    setIsLoading(false);
    onClose();
  };

  const isHIV = initialSubject?.includes('HIV');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-xl p-8 max-w-md w-full shadow-2xl relative border-t-4 border-accent">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-extrabold mb-2 text-primary font-heading">
            {isHIV ? 'Atendimento Sigiloso' : 'Solicitar Análise'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isHIV 
              ? 'Seus dados são protegidos por sigilo absoluto.' 
              : 'Preencha para falar diretamente com o Dr. João Victor.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
              Nome Completo
            </label>
            <Input
              type="text"
              required
              placeholder="Seu nome"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-secondary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
              WhatsApp
            </label>
            <Input
              type="tel"
              required
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="bg-secondary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
              Relato (Opcional)
            </label>
            <Textarea
              placeholder="Breve descrição..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="bg-secondary h-24 resize-none"
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Iniciar Conversa
          </Button>
        </form>
      </div>
    </div>
  );
};
