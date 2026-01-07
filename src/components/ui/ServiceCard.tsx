import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaText: string;
  onClick?: () => void;
  className?: string;
}

export const ServiceCard = ({ 
  icon: Icon, 
  title, 
  description, 
  ctaText, 
  onClick,
  className 
}: ServiceCardProps) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-card rounded-xl p-8 border border-border",
      "hover:border-accent transition-all duration-300",
      "shadow-card hover:shadow-card-hover",
      "cursor-pointer group",
      className
    )}
  >
    <div className="mb-6 w-12 h-12 flex items-center justify-center rounded-lg bg-primary">
      <Icon className="w-6 h-6 text-primary-foreground" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-primary font-heading">{title}</h3>
    <p className="text-sm mb-6 text-muted-foreground">
      {description}
    </p>
    <span className="text-sm font-bold uppercase tracking-wide flex items-center text-accent group-hover:gap-3 transition-all">
      {ctaText} <ArrowRight className="w-4 h-4 ml-2" />
    </span>
  </div>
);
