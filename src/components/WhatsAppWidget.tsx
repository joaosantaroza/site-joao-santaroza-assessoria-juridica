import { useState } from "react";
import { MessageCircle, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CONTACT_INFO } from "@/lib/constants";

const WHATSAPP_NUMBER = CONTACT_INFO.whatsapp.replace(/\D/g, "");

interface WhatsAppOption {
  label: string;
  emoji: string;
  message: string;
}

const OPTIONS: WhatsAppOption[] = [
  {
    label: "Isenção de IR (HIV)",
    emoji: "🔒",
    message: "Olá, Dr. João! Sou portador(a) de HIV e gostaria de saber sobre a isenção de imposto de renda. Pode me orientar?",
  },
  {
    label: "Isenção por Doença Grave",
    emoji: "🩺",
    message: "Olá, Dr. João! Tenho uma doença grave e gostaria de saber se tenho direito à isenção de IR. Pode me ajudar?",
  },
  {
    label: "Desbloqueio de Contas",
    emoji: "🔓",
    message: "Olá, Dr. João! Tive minha conta bloqueada judicialmente e preciso de orientação para desbloqueio. Pode me ajudar?",
  },
  {
    label: "Direito do Trabalho",
    emoji: "👷",
    message: "Olá, Dr. João! Preciso de orientação sobre uma questão trabalhista. Pode me ajudar?",
  },
  {
    label: "Dívidas e Prescrição",
    emoji: "⏳",
    message: "Olá, Dr. João! Tenho dívidas antigas e gostaria de saber se estão prescritas. Pode analisar meu caso?",
  },
  {
    label: "Contratos e Societário",
    emoji: "📄",
    message: "Olá, Dr. João! Preciso de assessoria para elaboração ou revisão de contrato. Pode me ajudar?",
  },
  {
    label: "Recuperação de Conta Digital",
    emoji: "📱",
    message: "Olá, Dr. João! Tive minha conta hackeada/bloqueada em uma plataforma digital e preciso de ajuda para recuperá-la.",
  },
  {
    label: "Outro assunto",
    emoji: "💬",
    message: "Olá, Dr. João! Gostaria de agendar uma consulta para tratar de um assunto jurídico. Pode me atender?",
  },
];

export const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (message: string) => {
    const url = `https://wa.me/55${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-card border border-border rounded-2xl shadow-2xl w-[320px] sm:w-[360px] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#25D366] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{CONTACT_INFO.firmName}</p>
                  <p className="text-white/80 text-xs">Online agora</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Intro */}
            <div className="px-5 py-3 bg-muted/30 border-b border-border">
              <p className="text-xs text-muted-foreground">
                Selecione o assunto para iniciar uma conversa no WhatsApp:
              </p>
            </div>

            {/* Options */}
            <div className="max-h-[320px] overflow-y-auto p-2">
              {OPTIONS.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionClick(option.message)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-lg flex-shrink-0">{option.emoji}</span>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {option.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow ${!isOpen ? 'animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] ring-4 ring-[#25D366]/30' : ''}`}
        aria-label="Abrir WhatsApp"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
