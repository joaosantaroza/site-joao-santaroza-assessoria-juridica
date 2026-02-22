import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, Eye, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import { getClusterById, CONTENT_CLUSTERS } from "@/lib/contentClusters";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactModal } from "@/components/ContactModal";
import { useState } from "react";
import { ViewType } from "@/lib/constants";
import { SectionTitle } from "@/components/ui/SectionTitle";
import NotFound from "./NotFound";

const PillarPage = () => {
  const { clusterId } = useParams<{ clusterId: string }>();
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const { articles, loading } = useBlogArticles();

  const cluster = clusterId ? getClusterById(clusterId) : undefined;

  // Filter articles belonging to this cluster
  const clusterArticles = cluster
    ? articles.filter((article) =>
        article.categories.some((cat) =>
          cluster.categories.some(
            (clusterCat) => cat.toLowerCase() === clusterCat.toLowerCase()
          )
        )
      )
    : [];

  // Other clusters for cross-linking
  const otherClusters = CONTENT_CLUSTERS.filter((c) => c.id !== clusterId);

  useSEO({
    title: cluster?.pillarTitle || "Página não encontrada",
    description: cluster?.pillarDescription || "",
    url: cluster?.pillarSlug,
    keywords: cluster?.keywords,
  });

  const handleNavigate = (view: ViewType) => {
    navigate("/");
  };

  if (!cluster) {
    return <NotFound />;
  }

  // Parse markdown bold in intro
  const renderIntro = (text: string) => {
    return text.split("\n\n").map((paragraph, i) => {
      const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="text-lg leading-relaxed text-muted-foreground mb-4">
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="text-foreground font-semibold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={handleNavigate} onContact={() => setShowContact(true)} />

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate">{cluster.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Guia Completo
          </div>

          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-8 text-primary font-heading leading-tight">
            {cluster.pillarTitle}
          </h1>

          <div className="bg-card border border-border rounded-xl p-6 lg:p-8 shadow-sm">
            {renderIntro(cluster.pillarIntro)}
          </div>

          {/* Keywords cloud */}
          <div className="flex flex-wrap gap-2 mt-6">
            {cluster.keywords.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <SectionTitle className="mb-8">
            {loading ? "Carregando artigos..." : `${clusterArticles.length} Artigos sobre ${cluster.name}`}
          </SectionTitle>

          {clusterArticles.length === 0 && !loading && (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Novos artigos sobre este tema serão publicados em breve.
              </p>
            </div>
          )}

          <div className="grid gap-6">
            {clusterArticles.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link
                  to={`/blog/${article.id}`}
                  className="group flex flex-col sm:flex-row gap-5 p-5 rounded-xl border border-border bg-card hover:border-accent hover:shadow-md transition-all"
                >
                  {/* Image */}
                  <div className="flex-shrink-0 w-full sm:w-40 h-32 sm:h-28 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h2 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                      <span>{article.date}</span>
                      {article.viewCount && article.viewCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount}
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-1 text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Ler artigo <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-linking: Other Pillar Pages */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-primary font-heading mb-6">
            Explore outros temas
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {otherClusters.map((c) => (
              <Link
                key={c.id}
                to={c.pillarSlug}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent transition-all"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                    {c.pillarTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {c.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-primary-foreground font-heading mb-3">
              Tem dúvidas sobre {cluster.name}?
            </h2>
            <p className="text-primary-foreground/80 mb-6">
              Fale com nossa equipe para uma análise personalizada do seu caso.
            </p>
            <button
              onClick={() => setShowContact(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-accent/90 transition-colors"
            >
              Falar com Advogado <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
};

export default PillarPage;
