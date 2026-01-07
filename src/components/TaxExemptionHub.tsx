import { ArrowRight, Lock, Activity, Shield } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ViewType } from "@/lib/constants";
import { motion } from "framer-motion";

interface TaxExemptionHubProps {
  onSelect: (view: ViewType) => void;
  onBack: () => void;
}

export const TaxExemptionHub = ({ onSelect, onBack }: TaxExemptionHubProps) => {
  return (
    <div className="animate-fade-in min-h-screen pb-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={onBack} 
          className="flex items-center text-sm font-bold uppercase tracking-wider group transition-colors text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Voltar
        </button>
      </div>

      <section className="container mx-auto px-4 pt-4 pb-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <SectionTitle>Isenção de Imposto de Renda</SectionTitle>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A Lei garante que Aposentados e Pensionistas com problemas de saúde não devem ter seus proventos tributados. Escolha sua situação:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* HIV Option */}
          <motion.div 
            onClick={() => onSelect('hiv')} 
            className="group relative overflow-hidden border-l-4 border-accent bg-card rounded-xl p-8 cursor-pointer shadow-card hover:shadow-card-hover transition-all"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 bg-primary">
                <Lock className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary font-heading">Portadores de HIV</h3>
              <p className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center text-accent">
                <Shield className="w-3 h-3 mr-1" /> Sigilo Absoluto
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Você tem direito à isenção total, <strong className="text-foreground">mesmo se for assintomático</strong>. Garantimos o sigilo do seu processo.
              </p>
              <div className="flex items-center font-bold text-primary">
                Entenda o Direito <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </motion.div>
          
          {/* General Option */}
          <motion.div 
            onClick={() => onSelect('general_tax')} 
            className="group relative overflow-hidden border-l-4 border-accent bg-card rounded-xl p-8 cursor-pointer shadow-card hover:shadow-card-hover transition-all"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 bg-primary">
                <Activity className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary font-heading">Outras Moléstias</h3>
              <p className="text-xs font-bold uppercase tracking-wider mb-4 text-accent">
                Lei 7.713/88
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Câncer, Cardiopatia Grave, Parkinson, Alienação Mental, Esclerose e outras condições graves.
              </p>
              <div className="flex items-center font-bold text-primary">
                Verificar Lista <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
