import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
            className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            Início
          </button>
          <button 
            onClick={() => onNavigate('practice_areas')} 
            className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            Especialidades
          </button>
          <Link 
            to="/blog"
            className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            Artigos
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
              className="text-left font-bold text-primary"
            >
              INÍCIO
            </button>
            <button 
              onClick={() => { onNavigate('practice_areas'); setIsMenuOpen(false); }} 
              className="text-left font-bold text-primary"
            >
              ESPECIALIDADES
            </button>
            <Link 
              to="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="text-left font-bold text-primary"
            >
              ARTIGOS
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
