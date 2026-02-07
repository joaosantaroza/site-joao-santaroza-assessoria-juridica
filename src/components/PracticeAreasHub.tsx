import { ArrowRight, BookOpen, Shield, Users, Clock, FileText, MessageCircle } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { CONTACT_INFO, ViewType } from "@/lib/constants";
import { motion } from "framer-motion";
import { PracticeAreaArticles } from "@/components/PracticeAreaArticles";
import { TestimonialsSection } from "@/components/TestimonialsSection";

interface PracticeAreasHubProps {
  onNavigate: (view: ViewType) => void;
  onBack: () => void;
}

export const PracticeAreasHub = ({ onNavigate, onBack }: PracticeAreasHubProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
          <SectionTitle>Como Podemos Ajudar</SectionTitle>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto text-muted-foreground">
            Nossa atuação é focada em resolver problemas que impedem o crescimento do seu patrimônio ou da sua empresa.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <ServiceCard
              icon={BookOpen}
              title="Isenção de Imposto de Renda"
              description="Para Aposentados, Pensionistas e Militares com doenças graves. Recupere valores pagos indevidamente."
              ctaText="Verificar Direito"
              onClick={() => onNavigate('tax_hub')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ServiceCard
              icon={Shield}
              title="Desbloqueio de Contas"
              description="Atuação emergencial contra penhoras e bloqueios judiciais que paralisam sua empresa."
              ctaText="Liberar Conta"
              onClick={() => onNavigate('unlock')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ServiceCard
              icon={Users}
              title="Direito do Trabalho"
              description="Defesa estratégica para Empresas e garantia de direitos para Empregados."
              ctaText="Saiba Mais"
              onClick={() => onNavigate('labor')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ServiceCard
              icon={Clock}
              title="Gestão de Passivos"
              description="Limpeza de nome e extinção de dívidas prescritas (Tributárias e Bancárias)."
              ctaText="Analisar Dívida"
              onClick={() => onNavigate('prescription')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ServiceCard
              icon={FileText}
              title="Contratos e Societário"
              description="Elaboração técnica de contratos e estruturação societária para blindar o negócio."
              ctaText="Proteger Negócio"
              onClick={() => onNavigate('contracts')}
            />
          </motion.div>

          {/* Quick Contact Card */}
          <motion.div variants={itemVariants}>
            <div 
              onClick={() => {
                const text = `Olá, Dr. João Victor! Gostaria de tirar algumas dúvidas jurídicas. Pode me ajudar?`;
                window.open(`https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
              }} 
              className="rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors border-2 border-dashed border-accent hover:bg-card/50 h-full"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-whatsapp">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-1 text-primary font-heading">Precisa de ajuda rápida?</h3>
              <p className="text-sm text-muted-foreground">Fale direto no WhatsApp</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Testimonials Section */}
        <div className="max-w-6xl mx-auto mt-16">
          <TestimonialsSection
            title="O Que Nossos Clientes Dizem"
            maxItems={3}
          />
        </div>

        {/* Featured Articles Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <PracticeAreaArticles
            categories={['Isenção', 'Tributário', 'Trabalho', 'Contrato', 'Holding', 'Planejamento']}
            title="Publicações Recentes"
            maxArticles={4}
          />
        </div>
      </section>
    </div>
  );
};
