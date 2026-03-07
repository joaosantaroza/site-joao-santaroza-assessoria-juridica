import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PracticeAreasHub } from "@/components/PracticeAreasHub";
import { ContactModal } from "@/components/ContactModal";
import { useSEO } from "@/hooks/useSEO";
import { ViewType } from "@/lib/constants";

export default function PracticeAreasPage() {
  const [showContact, setShowContact] = useState(false);

  useSEO({
    title: "Especialidades | João Santaroza Assessoria Jurídica",
    description:
      "Isenção de IR por doença grave, Desbloqueio de Contas, Direito do Trabalho, Contratos Empresariais e Recuperação de Contas Digitais. Atendimento em todo o Brasil.",
    url: "/especialidades",
    keywords: [
      "especialidades jurídicas",
      "isenção imposto de renda",
      "desbloqueio de contas",
      "direito trabalhista",
      "recuperação de contas digitais",
    ],
  });

  const handleNavigate = (view: ViewType) => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={handleNavigate} onContact={() => setShowContact(true)} />
      <PracticeAreasHub onNavigate={handleNavigate} onBack={() => window.history.back()} />
      <Footer />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}
