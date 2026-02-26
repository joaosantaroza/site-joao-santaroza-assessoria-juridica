import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = 'hsl(var(--accent))', width = 80, height = 24 }: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return '';
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }, [data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg width={width} height={height} className="shrink-0">
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
