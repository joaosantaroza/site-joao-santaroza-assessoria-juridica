import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, MessageCircle, ArrowDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConversionFunnelProps {
  totalViews: number;
  totalLeads: number;
  totalWhatsapp: number;
}

export function ConversionFunnel({ totalViews, totalLeads, totalWhatsapp }: ConversionFunnelProps) {
  const rates = useMemo(() => {
    const viewToLead = totalViews > 0 ? (totalLeads / totalViews) * 100 : null;
    const leadToWhatsapp = totalLeads > 0 ? (totalWhatsapp / totalLeads) * 100 : null;
    const viewToWhatsapp = totalViews > 0 ? (totalWhatsapp / totalViews) * 100 : null;
    return { viewToLead, leadToWhatsapp, viewToWhatsapp };
  }, [totalViews, totalLeads, totalWhatsapp]);

  const maxValue = Math.max(totalViews, totalLeads, totalWhatsapp, 1);

  const steps = [
    {
      label: 'Visualizações',
      value: totalViews,
      icon: Eye,
      color: 'hsl(var(--accent))',
      bgClass: 'bg-accent/20',
      barClass: 'bg-accent',
      width: (totalViews / maxValue) * 100,
    },
    {
      label: 'Downloads E-book',
      value: totalLeads,
      icon: Download,
      color: 'hsl(var(--primary))',
      bgClass: 'bg-primary/20',
      barClass: 'bg-primary',
      width: (totalLeads / maxValue) * 100,
    },
    {
      label: 'Contato WhatsApp',
      value: totalWhatsapp,
      icon: MessageCircle,
      color: '#25D366',
      bgClass: 'bg-[#25D366]/20',
      barClass: 'bg-[#25D366]',
      width: (totalWhatsapp / maxValue) * 100,
    },
  ];

  const ratesBetween = [rates.viewToLead, rates.leadToWhatsapp];
  const rateLabels = [
    { from: 'Visualizações', to: 'Downloads', calc: `${totalLeads} / ${totalViews} × 100` },
    { from: 'Downloads', to: 'WhatsApp', calc: `${totalWhatsapp} / ${totalLeads} × 100` },
  ];

  const formatRate = (rate: number | null) => {
    if (rate === null) return 'N/A';
    return rate < 0.1 ? `${rate.toFixed(2)}%` : `${rate.toFixed(1)}%`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.label}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="relative"
            >
              <div
                className={`${step.barClass} rounded-lg px-4 py-3 flex items-center gap-3 text-white`}
                style={{ width: `${Math.max(step.width, 20)}%`, minWidth: '180px' }}
              >
                <step.icon className="h-5 w-5 shrink-0" />
                <span className="font-medium text-sm truncate">{step.label}</span>
                <span className="font-bold text-lg ml-auto">{step.value.toLocaleString('pt-BR')}</span>
              </div>
            </motion.div>

            {i < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 + 0.3, duration: 0.3 }}
                className="flex items-center gap-2 pl-6 py-1"
              >
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground cursor-help">
                      {formatRate(ratesBetween[i])}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {rateLabels[i].from} → {rateLabels[i].to}: {rateLabels[i].calc}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </div>
        ))}

        {/* Overall rate */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="pt-3 border-t border-border flex items-center gap-2"
        >
          <span className="text-xs text-muted-foreground">Taxa geral (Visita → WhatsApp):</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-bold text-foreground cursor-help">
                {formatRate(rates.viewToWhatsapp)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{totalWhatsapp} / {totalViews} × 100</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
