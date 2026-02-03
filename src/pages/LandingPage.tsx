import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Phone, CheckCircle, Shield, Clock, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CONTACT_INFO } from '@/lib/constants';
import { useSEO } from '@/hooks/useSEO';
import { useConversionTracking } from '@/components/ConversionTracking';
import { LocalBusinessSchema } from '@/components/seo';

// Landing page configurations for different services
const LANDING_PAGES = {
  'isencao-imposto-renda': {
    title: 'Isenção de Imposto de Renda para Doenças Graves',
    subtitle: 'Aposentado com doença grave? Você pode ter direito à isenção total do IR e restituição dos últimos 5 anos.',
    headline: 'Recupere seu dinheiro. Garanta sua isenção.',
    description: 'Assessoria jurídica especializada para portadores de HIV, câncer, cardiopatia grave e outras 14 doenças previstas em lei.',
    benefits: [
      'Isenção total do IR sobre aposentadoria',
      'Restituição retroativa de até 5 anos',
      'Correção pela taxa SELIC',
      'Processo 100% digital',
      'Sigilo absoluto garantido por lei',
    ],
    stats: [
      { value: '5 anos', label: 'de restituição' },
      { value: '100%', label: 'digital' },
      { value: 'R$ 50k+', label: 'média recuperada' },
    ],
    faqs: [
      {
        question: 'Preciso estar incapacitado para ter direito?',
        answer: 'Não. A Súmula 627 do STJ garante o direito mesmo sem sintomas ativos.',
      },
      {
        question: 'Quanto tempo demora o processo?',
        answer: 'Com tutela de urgência, é possível obter a isenção em semanas.',
      },
      {
        question: 'Qual o custo do serviço?',
        answer: 'Honorários apenas em caso de êxito. Sem custos iniciais.',
      },
    ],
    keywords: ['isenção imposto de renda', 'doença grave', 'aposentado', 'restituição IR'],
  },
  'desbloqueio-contas': {
    title: 'Desbloqueio de Contas Judiciais',
    subtitle: 'Sua conta foi bloqueada? Entenda seus direitos e como liberar seus recursos rapidamente.',
    headline: 'Libere seu dinheiro bloqueado.',
    description: 'Assessoria técnica para desbloqueio de contas, impugnação de penhoras e defesa em execuções.',
    benefits: [
      'Análise de impenhorabilidade',
      'Tutela de urgência para liberação',
      'Defesa em execuções fiscais e cíveis',
      'Impugnação de penhoras indevidas',
      'Negociação de acordos',
    ],
    stats: [
      { value: '48h', label: 'análise inicial' },
      { value: 'Urgente', label: 'atendimento' },
      { value: 'Nacional', label: 'atuação' },
    ],
    faqs: [
      {
        question: 'Valores de salário podem ser penhorados?',
        answer: 'Em regra, salários são impenhoráveis. Podemos buscar a liberação.',
      },
      {
        question: 'Como funciona a defesa?',
        answer: 'Analisamos a execução, identificamos vícios e apresentamos a defesa adequada.',
      },
      {
        question: 'Quanto tempo para desbloquear?',
        answer: 'Com tutela de urgência, a liberação pode ocorrer em dias.',
      },
    ],
    keywords: ['desbloqueio conta', 'penhora judicial', 'SISBAJUD', 'conta bloqueada'],
  },
  'advogado-trabalhista': {
    title: 'Assessoria em Direito do Trabalho',
    subtitle: 'Orientação jurídica para empresas e trabalhadores. Defesa técnica e soluções negociadas.',
    headline: 'Seus direitos trabalhistas protegidos.',
    description: 'Atuação completa em questões trabalhistas: rescisões, verbas, acordos e reclamações.',
    benefits: [
      'Cálculo de verbas rescisórias',
      'Defesa em reclamações trabalhistas',
      'Acordos extrajudiciais',
      'Consultoria preventiva para empresas',
      'Reconhecimento de vínculo',
    ],
    stats: [
      { value: '2 anos', label: 'prazo para reclamar' },
      { value: '5 anos', label: 'de direitos' },
      { value: 'Acordo', label: 'ou litigio' },
    ],
    faqs: [
      {
        question: 'Qual o prazo para entrar com ação?',
        answer: 'Até 2 anos após o desligamento, reclamando os últimos 5 anos.',
      },
      {
        question: 'Posso fazer acordo antes de ir à Justiça?',
        answer: 'Sim, a CLT permite acordos extrajudiciais homologados.',
      },
      {
        question: 'Empresa pode me contratar para defesa?',
        answer: 'Sim, atuamos tanto para empregados quanto para empregadores.',
      },
    ],
    keywords: ['advogado trabalhista', 'direito do trabalho', 'rescisão', 'verbas trabalhistas'],
  },
};

type LandingPageKey = keyof typeof LANDING_PAGES;

const LandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { trackWhatsAppClick, trackPhoneClick, trackContactModalOpen } = useConversionTracking();

  const pageConfig = slug ? LANDING_PAGES[slug as LandingPageKey] : null;

  useSEO({
    title: pageConfig?.title || 'Assessoria Jurídica',
    description: pageConfig?.description || '',
    keywords: pageConfig?.keywords,
    url: `/lp/${slug}`,
  });

  useEffect(() => {
    if (!pageConfig) {
      navigate('/');
    }
  }, [pageConfig, navigate]);

  if (!pageConfig) {
    return null;
  }

  const handleWhatsAppClick = () => {
    trackWhatsAppClick(`lp_${slug}`);
    const text = `Olá! Vi a página sobre ${pageConfig.title} e gostaria de uma orientação.`;
    window.open(
      `https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  const handlePhoneClick = () => {
    trackPhoneClick(`lp_${slug}`);
    window.open(`tel:+55${CONTACT_INFO.phone.replace(/\D/g, '')}`, '_self');
  };

  return (
    <div className="min-h-screen bg-background">
      <LocalBusinessSchema />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Assessoria Jurídica Especializada
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-6 leading-tight">
              {pageConfig.headline}
            </h1>

            <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              {pageConfig.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleWhatsAppClick}
                className="bg-whatsapp hover:bg-whatsapp/90 text-white"
                data-event="click_whatsapp"
                data-source={`lp_${slug}`}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar no WhatsApp
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handlePhoneClick}
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                data-event="click_phone"
                data-source={`lp_${slug}`}
              >
                <Phone className="w-5 h-5 mr-2" />
                Ligar Agora
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {pageConfig.stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
              Por que escolher nossa assessoria?
            </h2>

            <div className="space-y-4">
              {pageConfig.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
              Perguntas Frequentes
            </h2>

            <div className="space-y-4">
              {pageConfig.faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
              Pronto para resolver sua situação?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Entre em contato agora e receba uma análise inicial do seu caso.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleWhatsAppClick}
                className="bg-whatsapp hover:bg-whatsapp/90 text-white"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/')}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Ver Mais Serviços
              </Button>
            </div>

            <p className="text-sm text-primary-foreground/60 mt-8">
              {CONTACT_INFO.oab} • Atendimento em todo o Brasil
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Sigilo Garantido</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Resposta em 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Atendimento Humanizado</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
