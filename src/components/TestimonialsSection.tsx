import { Quote, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Testimonial, getTestimonialsByArea, getFeaturedTestimonials } from "@/lib/testimonials";

interface TestimonialsSectionProps {
  /** Practice area ID to filter testimonials */
  areaId?: string;
  /** Section title */
  title?: string;
  /** Maximum testimonials to show */
  maxItems?: number;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-warning fill-warning' : 'text-muted-foreground/30'
        }`}
      />
    ))}
  </div>
);

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="relative bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
  >
    {/* Quote icon */}
    <div className="absolute -top-3 -left-2">
      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
        <Quote className="w-4 h-4 text-accent-foreground" />
      </div>
    </div>

    {/* Content */}
    <div className="pt-2">
      <p className="text-foreground leading-relaxed mb-4 italic">
        "{testimonial.text}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="font-semibold text-sm text-primary">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.date}</p>
        </div>
        <StarRating rating={testimonial.rating} />
      </div>
    </div>
  </motion.div>
);

export const TestimonialsSection = ({
  areaId,
  title = "O Que Nossos Clientes Dizem",
  maxItems = 3,
}: TestimonialsSectionProps) => {
  const testimonials = areaId
    ? getTestimonialsByArea(areaId).slice(0, maxItems)
    : getFeaturedTestimonials(maxItems);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/10">
          <Quote className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-xl font-bold text-primary font-heading">{title}</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, idx) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} index={idx} />
        ))}
      </div>

      {/* Trust badge */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <strong className="text-foreground">4.9/5</strong> baseado em avaliações de clientes
          </span>
        </p>
      </div>
    </section>
  );
};
