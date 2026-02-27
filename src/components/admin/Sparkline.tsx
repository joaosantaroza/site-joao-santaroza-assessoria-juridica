import { useMemo, useState } from 'react';
import { subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  trend?: number | null;
}

export function Sparkline({ data, color = 'hsl(var(--accent))', width = 80, height = 24, trend }: SparklineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const gradientId = useMemo(() => `spark-grad-${Math.random().toString(36).slice(2, 8)}`, []);

  const { path, areaPath, points } = useMemo(() => {
    if (data.length < 2) return { path: '', areaPath: '', points: [] as { x: number; y: number }[] };
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const pts = data.map((v, i) => ({
      x: i * stepX,
      y: height - ((v - min) / range) * (height - 2) - 1,
    }));
    const d = `M${pts.map(p => `${p.x},${p.y}`).join(' L')}`;
    const area = `${d} L${pts[pts.length - 1].x},${height} L${pts[0].x},${height} Z`;
    return { path: d, areaPath: area, points: pts };
  }, [data, width, height]);

  if (data.length < 2) return null;

  const now = new Date();
  const stepX = width / (data.length - 1);
  const hitAreaWidth = stepX * 0.8;

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="relative" style={{ width, height: height + 4 }}>
        <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          stroke="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {hoveredIndex !== null && points[hoveredIndex] && (
          <circle cx={points[hoveredIndex].x} cy={points[hoveredIndex].y} r={3} fill={color} />
        )}
        {/* Invisible hit areas */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={p.x - hitAreaWidth / 2}
            y={0}
            width={hitAreaWidth}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </svg>
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute z-50 pointer-events-none rounded bg-popover border border-border px-2 py-1 text-xs text-popover-foreground shadow-md whitespace-nowrap"
          style={{
            left: points[hoveredIndex].x,
            bottom: height + 6,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="font-medium">{data[hoveredIndex]}</span>
          <span className="text-muted-foreground ml-1">
            {subDays(now, data.length - 1 - hoveredIndex).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
      )}
      </div>
      {trend != null && (
        <motion.div
          className={`flex items-center gap-0.5 text-[10px] font-medium ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {trend > 0 ? '+' : ''}{trend}%
        </motion.div>
      )}
    </div>
  );
}
