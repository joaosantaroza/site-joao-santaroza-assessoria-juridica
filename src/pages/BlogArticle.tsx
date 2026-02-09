import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, User, MessageCircle, Download, Loader2, Home } from "lucide-react";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { BlogArticle as BlogArticleType, CONTACT_INFO } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArticleAudioPlayer } from "@/components/ArticleAudioPlayer";
import { EbookLeadModal } from "@/components/EbookLeadModal";
import { ArticleEbookBanner } from "@/components/ArticleEbookBanner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactModal } from "@/components/ContactModal";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import { RelatedArticles } from "@/components/RelatedArticles";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { FloatingShareButton } from "@/components/FloatingShareButton";
import { ArticleSchema } from "@/components/seo";
import { BreadcrumbsJsonLd, BreadcrumbItem as BreadcrumbItemType } from "@/components/BreadcrumbsJsonLd";
import { useSEO } from "@/hooks/useSEO";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ebookGestanteCapa from '@/assets/ebook-gestante-capa.png';
import ebookPontoBritanicoCapa from '@/assets/ebook-ponto-britanico-capa.png';

interface EbookConfig {
  id: string;
  title: string;
  pdfPath: string;
  downloadName: string;
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { findArticleById, articles, loading } = useBlogArticles();
  const [showContactModal, setShowContactModal] = useState(false);
  const [ebookModal, setEbookModal] = useState<EbookConfig | null>(null);

  const article = useMemo(() => {
    if (!slug) return null;
    return findArticleById(slug);
  }, [slug, findArticleById]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Ensure image URL is absolute for OG/Twitter meta tags
  const absoluteImageUrl = useMemo(() => {
    if (!article?.image) return undefined;
    if (article.image.startsWith('http')) return article.image;
    return `https://joaosantarozaadvocacia.com.br${article.image.startsWith('/') ? '' : '/'}${article.image}`;
  }, [article?.image]);

  // Dynamic SEO meta tags with keywords from categories
  useSEO({
    title: article?.title || 'Artigo não encontrado',
    description: article?.excerpt || 'Artigo jurídico do escritório João Santaroza Assessoria Jurídica.',
    image: absoluteImageUrl,
    url: `/blog/${slug}`,
    type: 'article',
    author: CONTACT_INFO.lawyerName,
    publishedTime: article?.date,
    modifiedTime: article?.updatedAt,
    section: article?.categories?.[0],
    keywords: article?.categories || [],
  });


  // Process content: convert literal \n to actual newlines and check if it's HTML or Markdown
  const { isHtml, processedContent } = useMemo(() => {
    let content = article?.content || '';
    
    // Replace literal \n\n and \n with actual newlines
    content = content.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
    
    // Check if content contains HTML tags
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
    
    return {
      isHtml: hasHtmlTags,
      processedContent: content
    };
  }, [article?.content]);

  // Breadcrumb items for JSON-LD structured data
  const breadcrumbItems: BreadcrumbItemType[] = useMemo(() => [
    { name: "Início", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: article?.title || "", path: `/blog/${slug}` },
  ], [article?.title, slug]);

  const handleWhatsAppContact = () => {
    if (!article) return;
    const text = `Olá, Dr. João Victor. Li o artigo "${article.title}" e gostaria de tirar algumas dúvidas sobre meu caso.`;
    window.open(`https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Dummy navigation handler for Navbar compatibility
  const handleNavigate = () => {};

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans selection:bg-accent selection:text-accent-foreground">
        <Navbar onNavigate={handleNavigate} onContact={() => setShowContactModal(true)} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen font-sans selection:bg-accent selection:text-accent-foreground">
        <Navbar onNavigate={handleNavigate} onContact={() => setShowContactModal(true)} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold text-primary mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-6">O artigo que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/blog')}>
            Voltar para o Blog
          </Button>
        </div>
        <Footer />
        <ContactModal 
          isOpen={showContactModal} 
          onClose={() => setShowContactModal(false)} 
          initialSubject="" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-accent selection:text-accent-foreground">
      {/* Reading Progress Bar */}
      <ReadingProgressBar />
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
      
      {/* Breadcrumbs JSON-LD Schema for Rich Snippets */}
      <BreadcrumbsJsonLd items={breadcrumbItems} />
      
      {/* Article JSON-LD Schema for Rich Snippets */}
      {article && (
        <ArticleSchema
          title={article.title}
          slug={slug || article.id}
          excerpt={article.excerpt}
          image={article.image}
          datePublished={article.date}
          categories={article.categories}
          readTime={article.readTime}
          content={article.content}
        />
      )}
      
      <Navbar onNavigate={handleNavigate} onContact={() => setShowContactModal(true)} />
      
      <main className="animate-fade-in min-h-screen bg-background pb-20">
        {/* Breadcrumbs Header */}
        <motion.div 
          className="bg-primary py-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="container mx-auto px-4">
            <Breadcrumb>
              <BreadcrumbList className="text-primary-foreground/70">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors">
                      <Home className="w-4 h-4" />
                      <span>Home</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-primary-foreground/50" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/blog" className="hover:text-primary-foreground transition-colors">
                      Blog
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-primary-foreground/50" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-primary-foreground font-medium truncate max-w-[200px] md:max-w-[400px]">
                    {article.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div 
          className="relative h-64 md:h-96 -mt-4"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </motion.div>

        {/* Article Content */}
        <article className="container mx-auto px-4 -mt-20 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Category Badges */}
            <motion.div 
              className="flex flex-wrap gap-2 mb-6"
              variants={fadeInUp}
            >
              {article.categories.map((cat) => (
                <Badge key={cat} className="bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider">
                  {cat}
                </Badge>
              ))}
            </motion.div>

            {/* Title */}
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary font-heading mb-6 leading-tight"
              variants={fadeInUp}
            >
              {article.title}
            </motion.h1>

            {/* Meta Info */}
            <motion.div 
              className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-10 pb-10 border-b border-border"
              variants={fadeInUp}
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {CONTACT_INFO.lawyerName}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.readTime} de leitura
              </span>
            </motion.div>

            {/* Audio Player */}
            <motion.div
              className="mb-10"
              variants={fadeInUp}
            >
              <ArticleAudioPlayer 
                articleContent={article.content || ''} 
                articleTitle={article.title} 
              />
            </motion.div>

            {/* Article Body - Supports Markdown and HTML */}
            <motion.div 
              className="article-content prose prose-lg max-w-none prose-headings:text-primary prose-headings:font-heading prose-p:text-foreground prose-strong:text-foreground prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedContent) }} />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {processedContent}
                </ReactMarkdown>
              )}
            </motion.div>

            {/* Dynamic eBook Banner from Database */}
            {article.hasEbook && article.ebookTitle && article.ebookPdfUrl && article.ebookCoverUrl && article.dbId && (
              <ArticleEbookBanner
                ebookId={article.dbId}
                ebookTitle={article.ebookTitle}
                ebookSubtitle={article.ebookSubtitle || "Baixe nosso guia completo e descubra como garantir seus direitos."}
                ebookCoverUrl={article.ebookCoverUrl}
                ebookPdfUrl={article.ebookPdfUrl}
              />
            )}

            {/* Download PDF Section - Only for HIV article */}
            {article.id === 'isencao-ir-hiv' && (
              <motion.div 
                className="mt-12 p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30 rounded-2xl"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-extrabold text-primary font-heading mb-3">
                    📘 E-book Gratuito
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    Baixe nosso guia completo sobre isenção de Imposto de Renda para portadores de HIV e entenda todos os seus direitos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setEbookModal({
                        id: "isencao-ir-hiv",
                        title: "Isenção de IR para Portadores de HIV",
                        pdfPath: "/assets/ebook-isencao-ir-hiv.pdf",
                        downloadName: "Ebook-Isencao-IR-HIV.pdf"
                      })}
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Baixar E-book em PDF
                    </Button>
                    <Button 
                      onClick={handleWhatsAppContact}
                      size="lg"
                      className="bg-whatsapp hover:bg-whatsapp/90 text-white"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Falar com Advogado
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Download PDF Section - Gestante article with banner */}
            {article.id === 'direitos-gestante-demitida' && (
              <motion.div 
                className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-full lg:w-1/3 flex-shrink-0">
                    <img 
                      src={ebookGestanteCapa} 
                      alt="Ebook Estabilidade dos Direitos Trabalhistas das Gestantes"
                      className="w-full max-w-[250px] mx-auto rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
                    />
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-xl md:text-2xl font-extrabold text-primary font-heading mb-3">
                      📘 E-book Gratuito
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-lg">
                      Baixe nosso guia completo sobre a Estabilidade dos Direitos 
                      Trabalhistas das Gestantes e entenda todos os seus direitos.
                    </p>
                    <div className="flex justify-center lg:justify-start">
                      <Button 
                        onClick={() => setEbookModal({
                          id: "estabilidade-gestante",
                          title: "Estabilidade dos Direitos Trabalhistas das Gestantes",
                          pdfPath: "/assets/ebook-estabilidade-gestante.pdf",
                          downloadName: "Ebook-Estabilidade-Gestante.pdf"
                        })}
                        size="lg"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Baixar E-book em PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Download PDF Section - Horário Britânico article with banner */}
            {article.id === 'horario-britanico-ponto' && (
              <motion.div 
                className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="w-full lg:w-1/3 flex-shrink-0">
                    <img 
                      src={ebookPontoBritanicoCapa} 
                      alt="Ebook Evitando o Horário Britânico no Ponto"
                      className="w-full max-w-[250px] mx-auto rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
                    />
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-xl md:text-2xl font-extrabold text-primary font-heading mb-3">
                      📘 E-book Gratuito
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-lg">
                      Baixe nosso guia completo sobre como evitar o "Horário Britânico" 
                      no controle de ponto e proteja sua empresa de condenações trabalhistas.
                    </p>
                    <div className="flex justify-center lg:justify-start">
                      <Button 
                        onClick={() => setEbookModal({
                          id: "ponto-britanico",
                          title: "Evitando o Horário Britânico no Ponto",
                          pdfPath: "/assets/ebook-ponto-britanico.pdf",
                          downloadName: "Ebook-Horario-Britanico-Ponto.pdf"
                        })}
                        size="lg"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Baixar E-book em PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CTA Box */}
            <motion.div 
              className="mt-16 p-8 md:p-12 bg-primary rounded-2xl text-center"
              initial={{ opacity: 0, y: 20, scale: 0.99 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h3 className="text-2xl md:text-3xl font-extrabold text-primary-foreground font-heading mb-4">
                Este artigo se aplica ao seu caso?
              </h3>
              <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
                Cada situação é única. Fale diretamente com nosso especialista para uma análise personalizada do seu direito.
              </p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button 
                  onClick={handleWhatsAppContact}
                  size="lg"
                  className="bg-whatsapp hover:bg-whatsapp/90 text-white"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Tirar Dúvidas no WhatsApp
                </Button>
                <Button 
                  onClick={() => setShowContactModal(true)}
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary"
                >
                  Agendar Consulta
                </Button>
              </motion.div>
            </motion.div>

            {/* Share Section at End of Article */}
            <motion.div 
              className="mt-12 p-6 bg-muted/50 rounded-xl border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-bold text-center mb-4 font-heading">Gostou do conteúdo? Compartilhe!</h3>
              <SocialShareButtons 
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={article.title}
                imageUrl={article.image}
                className="justify-center"
              />
            </motion.div>

            {/* Author Box */}
            <motion.div 
              className="mt-12 p-6 bg-secondary rounded-xl flex flex-col md:flex-row items-center gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.img 
                src={CONTACT_INFO.lawyerPhoto} 
                alt={CONTACT_INFO.lawyerName}
                className="w-20 h-20 rounded-full object-cover"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
              <div className="text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Autor</p>
                <h4 className="font-bold text-primary font-heading">{CONTACT_INFO.lawyerName}</h4>
                <p className="text-sm text-muted-foreground">{CONTACT_INFO.oab} • Especialista em Direito Tributário e Trabalhista</p>
              </div>
            </motion.div>

            {/* Related Articles */}
            <RelatedArticles
              currentArticle={article}
              allArticles={articles}
            />
          </motion.div>
        </article>
      </main>

      <Footer />

      {/* E-book Lead Capture Modal */}
      {ebookModal && (
        <EbookLeadModal
          isOpen={!!ebookModal}
          onClose={() => setEbookModal(null)}
          ebookId={ebookModal.id}
          ebookTitle={ebookModal.title}
          ebookPdfPath={ebookModal.pdfPath}
          ebookDownloadName={ebookModal.downloadName}
        />
      )}

      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
        initialSubject={article?.title || ''} 
      />

      {/* Floating Share Button */}
      <FloatingShareButton 
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={article?.title || ''}
        imageUrl={article?.image}
        showAfterScroll={400}
      />
    </div>
  );
}
