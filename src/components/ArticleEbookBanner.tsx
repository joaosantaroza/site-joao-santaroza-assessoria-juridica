import { useState } from "react";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArticleEbookLeadModal } from "@/components/ArticleEbookLeadModal";

interface ArticleEbookBannerProps {
  ebookId: string;
  ebookTitle: string;
  ebookSubtitle: string;
  ebookCoverUrl: string;
  ebookPdfUrl: string;
}

export const ArticleEbookBanner = ({
  ebookId,
  ebookTitle,
  ebookSubtitle,
  ebookCoverUrl,
  ebookPdfUrl,
}: ArticleEbookBannerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div 
        className="mt-12 p-8 bg-primary border-2 border-accent/30 rounded-2xl overflow-hidden relative"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Decorative accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/50 via-accent to-accent/50" />
        
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Capa do eBook */}
          <div className="w-full lg:w-1/3 flex-shrink-0">
            <motion.img 
              src={ebookCoverUrl} 
              alt={ebookTitle}
              className="w-full max-w-[220px] mx-auto rounded-lg shadow-2xl hover:shadow-accent/20 transition-shadow duration-300 border border-accent/20"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          
          {/* Conteúdo e Botões */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                📘 E-book Gratuito
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold text-primary-foreground font-heading mb-3">
                {ebookTitle}
              </h3>
              <p className="text-primary-foreground/70 mb-6 max-w-lg">
                {ebookSubtitle}
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar E-book Grátis
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Lead Capture Modal */}
      <ArticleEbookLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ebookId={ebookId}
        ebookTitle={ebookTitle}
        ebookPdfUrl={ebookPdfUrl}
        ebookCoverUrl={ebookCoverUrl}
      />
    </>
  );
};
