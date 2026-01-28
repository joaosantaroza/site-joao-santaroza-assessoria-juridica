import { Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { CONTACT_INFO } from "@/lib/constants";
import logoFull from "@/assets/logo-full.png";

export const Footer = () => (
  <footer className="bg-card border-t border-border py-16">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
        <div>
          <img 
            src={logoFull} 
            alt="João Santaroza - Assessoria Jurídica" 
            className="h-12 w-auto mb-4"
          />
          <p className="text-sm text-muted-foreground mb-1">{CONTACT_INFO.address}</p>
          <p className="text-sm font-bold text-accent">{CONTACT_INFO.oab}</p>
        </div>
        <div className="flex gap-6">
          <a 
            href={`https://instagram.com/${CONTACT_INFO.instagram.replace('@','')}`} 
            target="_blank" 
            rel="noreferrer" 
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a 
            href={`mailto:${CONTACT_INFO.email}`} 
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Mail className="w-6 h-6" />
          </a>
        </div>
      </div>
      <div className="border-t border-border pt-8 text-xs text-muted-foreground text-justify leading-relaxed font-light">
        <p className="mb-2 font-bold uppercase tracking-wider text-slate">Compliance & Ética</p>
        <p>
          Este site tem caráter meramente informativo e educacional, em estrita observância ao Código de Ética e Disciplina da OAB (Provimento 205/2021). 
          O conteúdo aqui exposto não constitui consultoria jurídica e não substitui a análise técnica individualizada. 
          Não garantimos resultados, pois a advocacia é uma atividade de meio.
        </p>
        <div className="mt-6 flex items-center justify-between">
          <p>&copy; {new Date().getFullYear()} {CONTACT_INFO.firmName}. Todos os direitos reservados.</p>
          <Link 
            to="/admin" 
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors text-[10px]"
          >
            Área restrita
          </Link>
        </div>
      </div>
    </div>
  </footer>
);
