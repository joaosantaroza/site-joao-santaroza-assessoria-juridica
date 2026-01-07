import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionTitle = ({ children, className }: SectionTitleProps) => (
  <h2 className={cn(
    "text-3xl lg:text-4xl font-extrabold tracking-tight mb-6 text-primary font-heading",
    className
  )}>
    {children}
  </h2>
);
