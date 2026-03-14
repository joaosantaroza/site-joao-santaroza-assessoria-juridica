import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_INFO } from "@/lib/constants";
import { ViewType } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import logoIcon from "@/assets/logo-icon.png";

interface NavbarProps {
  onNavigate: (view: ViewType) => void;
  onContact: () => void;
}

export const Navbar = ({ onNavigate, onContact }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const handleHomeClick = () => {
    navigate('/');
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={handleHomeClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img 
            src={logoIcon} 
            alt="João Santaroza Logo" 
            className="h-14 w-auto transition-transform group-hover:scale-105"
          />
          <div>
            <h1 className="font-extrabold text-lg leading-none tracking-tight text-primary font-heading">
              {CONTACT_INFO.firmName}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1 text-accent">
              {CONTACT_INFO.firmSub}
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          <button 
            onClick={handleHomeClick}
            className={`text-sm font-bold uppercase tracking-wider transition-colors ${isActive("/") ? "text-primary border-b-2 border-accent pb-1" : "text-muted-foreground hover:text-primary"}`}
          >
            Início
          </button>
          <Link 
            to="/especialidades"
            className={`text-sm font-bold uppercase tracking-wider transition-colors ${isActive("/especialidades") ? "text-primary border-b-2 border-accent pb-1" : "text-muted-foreground hover:text-primary"}`}
          >
            Especialidades
          </Link>
          <Link 
            to="/sobre"
            className={`text-sm font-bold uppercase tracking-wider transition-colors ${isActive("/sobre") ? "text-primary border-b-2 border-accent pb-1" : "text-muted-foreground hover:text-primary"}`}
          >
            Sobre
          </Link>
          <Link 
            to="/blog"
            className={`text-sm font-bold uppercase tracking-wider transition-colors ${isActive("/blog") ? "text-primary border-b-2 border-accent pb-1" : "text-muted-foreground hover:text-primary"}`}
          >
            Artigos
          </Link>
          <Link 
            to="/temas/auxilio-acidente"
            className={`text-sm font-bold uppercase tracking-wider transition-colors ${isActive("/temas/auxilio-acidente") ? "text-primary border-b-2 border-accent pb-1" : "text-muted-foreground hover:text-primary"}`}
          >
            Auxílio-Acidente
          </Link>
          <Link 
            to="/temas/desbloqueio-mercado-livre"
            className={`text-sm font-bold uppercase tracking-wider transition-colors ${isActive("/temas/desbloqueio-mercado-livre") ? "text-primary border-b-2 border-accent pb-1" : "text-muted-foreground hover:text-primary"}`}
          >
            Mercado Livre
          </Link>
          <Link 
            to="/temas/reajuste-plano-saude"
            className={`text-sm font-bold uppercase tracking-wider transition-colors ${isActive("/temas/reajuste-plano-saude") ? "text-primary border-b-2 border-accent pb-1" : "text-muted-foreground hover:text-primary"}`}
          >
            Plano de Saúde
          </Link>
          <Button onClick={onContact} size="sm">
            Agendar Consulta
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-primary" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-24 left-0 w-full bg-card border-b border-border p-6 flex flex-col gap-6 shadow-xl lg:hidden"
          >
            <button 
              onClick={() => { handleHomeClick(); setIsMenuOpen(false); }} 
              className={`text-left font-bold ${isActive("/") ? "text-primary border-b-2 border-accent pb-1 inline-block" : "text-primary"}`}
            >
              INÍCIO
            </button>
            <Link 
              to="/especialidades"
              onClick={() => setIsMenuOpen(false)}
              className={`text-left font-bold ${isActive("/especialidades") ? "text-primary border-b-2 border-accent pb-1 inline-block" : "text-primary"}`}
            >
              ESPECIALIDADES
            </Link>
            <Link 
              to="/sobre"
              onClick={() => setIsMenuOpen(false)}
              className={`text-left font-bold ${isActive("/sobre") ? "text-primary border-b-2 border-accent pb-1 inline-block" : "text-primary"}`}
            >
              SOBRE
            </Link>
            <Link 
              to="/blog"
              onClick={() => setIsMenuOpen(false)}
              className={`text-left font-bold ${isActive("/blog") ? "text-primary border-b-2 border-accent pb-1 inline-block" : "text-primary"}`}
            >
              ARTIGOS
            </Link>
            <Link 
              to="/temas/auxilio-acidente"
              onClick={() => setIsMenuOpen(false)}
              className={`text-left font-bold ${isActive("/temas/auxilio-acidente") ? "text-primary border-b-2 border-accent pb-1 inline-block" : "text-primary"}`}
            >
              AUXÍLIO-ACIDENTE
            </Link>
            <Link 
              to="/temas/desbloqueio-mercado-livre"
              onClick={() => setIsMenuOpen(false)}
              className={`text-left font-bold ${isActive("/temas/desbloqueio-mercado-livre") ? "text-primary border-b-2 border-accent pb-1 inline-block" : "text-primary"}`}
            >
              MERCADO LIVRE
            </Link>
            <Button
              onClick={() => { onContact(); setIsMenuOpen(false); }} 
              className="w-full"
            >
              Falar com Advogado
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
