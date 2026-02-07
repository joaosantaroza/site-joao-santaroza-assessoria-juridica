import { ArrowRight, CheckCircle, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Service } from "@/lib/constants";
import { motion } from "framer-motion";
import { PracticeAreaArticles } from "@/components/PracticeAreaArticles";
import { PRACTICE_AREA_CATEGORIES, PRACTICE_AREA_ARTICLE_TITLES } from "@/lib/practiceAreaCategories";

interface ServicePageProps {
  service: Service;
  onBack: () => void;
  onContact: () => void;
}

export const ServicePage = ({ service, onBack, onContact }: ServicePageProps) => {
  const Icon = service.icon;
  const isHIV = service.id === 'hiv';

  return (
    <div className="animate-fade-in pb-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={onBack} 
          className="flex items-center text-sm font-bold uppercase tracking-wider group transition-colors text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Voltar
        </button>
      </div>

      <section className="container mx-auto px-4 py-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {isHIV && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-8">
              <Lock className="w-3 h-3" /> Sigilo Absoluto Garantido
            </div>
          )}

          <div className="inline-flex p-5 rounded-2xl mb-8 shadow-lg bg-primary">
            <Icon className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-6 text-primary font-heading">
            {service.heroTitle}
          </h1>
          <p className="text-xl leading-relaxed mb-10 max-w-2xl mx-auto text-muted-foreground">
            {service.heroSubtitle}
          </p>

          <div className="bg-card border-l-4 border-accent p-6 mb-10 text-left max-w-2xl mx-auto shadow-md rounded-r-lg">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 flex-shrink-0 mt-1 text-primary" />
              <div className="text-sm text-muted-foreground leading-relaxed">
                {isHIV ? (
                  <><strong className="text-foreground">Privacidade Total:</strong> Conforme a Lei 14.289/2022, seu processo poderá tramitar em Segredo de Justiça, preservando seu diagnóstico.</>
                ) : (
                  <><strong className="text-foreground">Análise Técnica:</strong> Cada caso exige análise individualizada. Nossa orientação é baseada em estudo documental para definição da estratégia adequada.</>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={onContact} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isHIV ? "Atendimento Sigiloso" : "Agende um Atendimento"}
            </Button>
            <Button onClick={onContact} variant="outline" size="lg">
              Tire suas Dúvidas
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {service.features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              className="bg-card p-8 rounded-xl border border-border flex flex-col items-center text-center hover:border-accent transition-all shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * idx }}
            >
              <CheckCircle className="w-8 h-8 mb-4 text-accent" />
              <span className="font-bold text-foreground">{feature}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Related Articles Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <PracticeAreaArticles
            categories={PRACTICE_AREA_CATEGORIES[service.id] || []}
            title={PRACTICE_AREA_ARTICLE_TITLES[service.id] || 'Artigos Relacionados'}
            maxArticles={3}
          />
        </div>
      </section>
    </div>
  );
};
