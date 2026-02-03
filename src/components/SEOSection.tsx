import { motion } from 'framer-motion';
import { Scale, FileText, Shield, Users, Building, Heart } from 'lucide-react';

/**
 * SEO-optimized text section for the homepage.
 * Contains natural keyword usage for target search terms.
 */
export const SEOSection = () => {
  const services = [
    {
      icon: Heart,
      title: 'Isenção de IR por Doença Grave',
      description: 'Assessoria especializada para aposentados e pensionistas com HIV, câncer, cardiopatia grave e outras moléstias previstas na Lei 7.713/88. Restituição dos últimos 5 anos.',
      keywords: ['isenção imposto de renda', 'doença grave', 'aposentado'],
    },
    {
      icon: Shield,
      title: 'Desbloqueio de Contas',
      description: 'Defesa técnica em bloqueios judiciais (SISBAJUD). Análise de impenhorabilidade, tutela de urgência e liberação de valores para pessoas físicas e empresas.',
      keywords: ['desbloqueio conta', 'penhora', 'SISBAJUD'],
    },
    {
      icon: Users,
      title: 'Direito do Trabalho',
      description: 'Orientação para empresas e trabalhadores. Cálculo de verbas rescisórias, defesa em reclamações trabalhistas, acordos extrajudiciais e consultoria preventiva.',
      keywords: ['advogado trabalhista', 'verbas rescisórias', 'CLT'],
    },
    {
      icon: Building,
      title: 'Contratos Empresariais',
      description: 'Elaboração e revisão de contratos comerciais, societários e de prestação de serviços. Segurança jurídica para suas relações empresariais.',
      keywords: ['contratos', 'direito empresarial', 'societário'],
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Scale className="w-4 h-4" />
            Assessoria Jurídica Especializada
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary font-heading mb-6">
            Advocacia com Foco em Resultados
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            O escritório <strong className="text-foreground">João Santaroza Assessoria Jurídica</strong> atua 
            com foco na resolução eficiente de problemas jurídicos. Combinamos conhecimento técnico atualizado 
            com atendimento humanizado para entregar soluções personalizadas em{' '}
            <strong className="text-foreground">Direito Tributário</strong>,{' '}
            <strong className="text-foreground">Trabalhista</strong> e{' '}
            <strong className="text-foreground">Empresarial</strong>.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <motion.article
              key={service.title}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Additional SEO text block */}
        <motion.div
          className="max-w-3xl mx-auto mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-muted-foreground leading-relaxed mb-4">
            Com sede no <strong className="text-foreground">Paraná</strong> e atuação em{' '}
            <strong className="text-foreground">todo o Brasil</strong>, oferecemos atendimento 100% digital 
            para clientes de qualquer localidade. Nossa equipe está preparada para analisar seu caso com 
            sigilo e agilidade, seja você um aposentado buscando a{' '}
            <em>isenção de imposto de renda por doença grave</em>, um empresário enfrentando{' '}
            <em>bloqueio de contas judiciais</em>, ou um trabalhador com dúvidas sobre seus{' '}
            <em>direitos na rescisão contratual</em>.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>OAB/PR 81.381 • Atendimento mediante agendamento</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
