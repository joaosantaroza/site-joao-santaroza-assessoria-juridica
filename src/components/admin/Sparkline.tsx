import { useMemo, useState } from 'react';
import { subDays } from 'date-fns';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = 'hsl(var(--accent))', width = 80, height = 24 }: SparklineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { path, points } = useMemo(() => {
    if (data.length < 2) return { path: '', points: [] as { x: number; y: number }[] };
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const pts = data.map((v, i) => ({
      x: i * stepX,
      y: height - ((v - min) / range) * (height - 2) - 1,
    }));
    const d = `M${pts.map(p => `${p.x},${p.y}`).join(' L')}`;
    return { path: d, points: pts };
  }, [data, width, height]);

  if (data.length < 2) return null;

  const now = new Date();
  const stepX = width / (data.length - 1);
  const hitAreaWidth = stepX * 0.8;

  return (
    <div className="relative shrink-0" style={{ width, height: height + 4 }}>
      <svg width={width} height={height} className="overflow-visible">
        <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
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
  );
}
