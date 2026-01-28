import { useMemo } from 'react';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EbookLead {
  id: string;
  name: string;
  phone: string;
  ebook_id: string;
  ebook_title: string;
  created_at: string;
}

interface LeadsChartProps {
  leads: EbookLead[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(280 65% 60%)'];

export function LeadsChart({ leads }: LeadsChartProps) {
  // Aggregate leads by month (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = startOfMonth(subMonths(now, i));
      const key = format(month, 'yyyy-MM');
      months[key] = 0;
    }
    
    // Count leads per month
    leads.forEach(lead => {
      const date = parseISO(lead.created_at);
      const key = format(date, 'yyyy-MM');
      if (months[key] !== undefined) {
        months[key]++;
      }
    });
    
    return Object.entries(months).map(([key, count]) => ({
      month: format(parseISO(`${key}-01`), 'MMM', { locale: ptBR }),
      fullMonth: format(parseISO(`${key}-01`), 'MMMM yyyy', { locale: ptBR }),
      leads: count
    }));
  }, [leads]);

  // Aggregate leads by ebook
  const ebookData = useMemo(() => {
    const ebooks: { [key: string]: { name: string; count: number } } = {};
    
    leads.forEach(lead => {
      if (!ebooks[lead.ebook_id]) {
        ebooks[lead.ebook_id] = { name: lead.ebook_title, count: 0 };
      }
      ebooks[lead.ebook_id].count++;
    });
    
    return Object.values(ebooks)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [leads]);

  // Calculate growth
  const growth = useMemo(() => {
    if (monthlyData.length < 2) return { value: 0, trend: 'neutral' as const };
    
    const current = monthlyData[monthlyData.length - 1].leads;
    const previous = monthlyData[monthlyData.length - 2].leads;
    
    if (previous === 0) {
      return { value: current > 0 ? 100 : 0, trend: current > 0 ? 'up' as const : 'neutral' as const };
    }
    
    const percentChange = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(percentChange)),
      trend: percentChange > 0 ? 'up' as const : percentChange < 0 ? 'down' as const : 'neutral' as const
    };
  }, [monthlyData]);

  const chartConfig = {
    leads: {
      label: "Leads",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Monthly Leads Bar Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Leads por Mês</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {growth.trend === 'up' && (
              <div className="flex items-center gap-1 text-sm text-accent">
                  <TrendingUp className="h-4 w-4" />
                  <span>+{growth.value}%</span>
                </div>
              )}
              {growth.trend === 'down' && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <TrendingDown className="h-4 w-4" />
                  <span>-{growth.value}%</span>
                </div>
              )}
              {growth.trend === 'neutral' && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Minus className="h-4 w-4" />
                  <span>0%</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => [`${value} leads`, '']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullMonth || label}
                  />
                }
              />
              <Bar 
                dataKey="leads" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Leads by Ebook Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads por E-book</CardTitle>
          <CardDescription>Distribuição de interesse</CardDescription>
        </CardHeader>
        <CardContent>
          {ebookData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <div className="h-[250px] flex items-center gap-4">
              <ChartContainer config={chartConfig} className="h-full flex-1">
                <PieChart>
                  <Pie
                    data={ebookData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {ebookData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value) => [`${value} leads`, '']}
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
              <div className="space-y-2 text-sm min-w-[140px]">
                {ebookData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate max-w-[120px]" title={item.name}>
                      {item.name.length > 18 ? `${item.name.slice(0, 18)}...` : item.name}
                    </span>
                    <span className="font-medium ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend Line Chart - Full Width */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Tendência de Captação</CardTitle>
          <CardDescription>Evolução mensal de leads</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value) => [`${value} leads`, '']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullMonth || label}
                  />
                }
              />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
