import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface HeatmapItem {
  created_at: string;
}

interface ActivityHeatmapProps {
  leads: HeatmapItem[];
  whatsappClicks: HeatmapItem[];
}

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ActivityHeatmap({ leads, whatsappClicks }: ActivityHeatmapProps) {
  const [activeSource, setActiveSource] = useState<'leads' | 'whatsapp'>('leads');
  const [tooltip, setTooltip] = useState<{ day: number; hour: number; count: number; x: number; y: number } | null>(null);

  const sourceData = activeSource === 'leads' ? leads : whatsappClicks;

  const { grid, maxCount } = useMemo(() => {
    const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let max = 0;
    sourceData.forEach(item => {
      const d = new Date(item.created_at);
      const day = d.getDay();
      const hour = d.getHours();
      g[day][hour]++;
      if (g[day][hour] > max) max = g[day][hour];
    });
    return { grid: g, maxCount: max };
  }, [sourceData]);

  const getOpacity = (count: number) => {
    if (maxCount === 0 || count === 0) return 0.05;
    return 0.05 + (count / maxCount) * 0.95;
  };

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveSource('leads')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeSource === 'leads' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Leads
        </button>
        <button
          onClick={() => setActiveSource('whatsapp')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeSource === 'whatsapp' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          WhatsApp
        </button>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-[2px] relative" onMouseLeave={() => setTooltip(null)}>
          {/* Hour labels */}
          <div className="flex gap-[2px] ml-10">
            {HOURS.map(h => (
              <div key={h} className="w-5 text-center text-[9px] text-muted-foreground">
                {h % 3 === 0 ? `${h}h` : ''}
              </div>
            ))}
          </div>

          {/* Rows */}
          {DAYS_PT.map((day, dayIdx) => (
            <motion.div
              key={day}
              className="flex items-center gap-[2px]"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: dayIdx * 0.05 }}
            >
              <span className="w-8 text-right text-[10px] text-muted-foreground mr-1 shrink-0">{day}</span>
              {HOURS.map(hour => {
                const count = grid[dayIdx][hour];
                return (
                  <div
                    key={hour}
                    className="w-5 h-5 rounded-[3px] cursor-pointer transition-transform hover:scale-125"
                    style={{
                      backgroundColor: `hsl(var(--accent) / ${getOpacity(count)})`,
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parent = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                      if (parent) {
                        setTooltip({
                          day: dayIdx,
                          hour,
                          count,
                          x: rect.left - parent.left + rect.width / 2,
                          y: rect.top - parent.top - 4,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </motion.div>
          ))}

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-50 pointer-events-none bg-popover border border-border text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {DAYS_PT[tooltip.day]} {tooltip.hour}h — <strong>{tooltip.count}</strong> {activeSource === 'leads' ? 'leads' : 'cliques'}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-[2px]">
          {[0.05, 0.25, 0.5, 0.75, 1].map((op, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-[2px]"
              style={{ backgroundColor: `hsl(var(--accent) / ${op})` }}
            />
          ))}
        </div>
        <span>Mais</span>
      </div>
    </div>
  );
}
