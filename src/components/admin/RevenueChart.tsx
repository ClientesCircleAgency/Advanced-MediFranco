import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Euro } from 'lucide-react';
import { useClinic } from '@/context/ClinicContext';
import { useSettings } from '@/hooks/useSettings';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';

type Period = 'day' | 'week' | 'month' | 'year';

const periodLabels: Record<Period, string> = {
  day: 'Hoje',
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
};

export function RevenueChart() {
  const { appointments } = useClinic();
  const { data: settings } = useSettings();
  const [activePeriod, setActivePeriod] = useState<Period>('month');

  const averageValue = (settings?.averageConsultationValue as number) || 50;

  const completedAppointments = useMemo(() => {
    return appointments.filter(a => a.status === 'completed');
  }, [appointments]);

  const revenueData = useMemo(() => {
    const today = new Date();
    
    const getCompletedInPeriod = (start: Date, end: Date) => {
      return completedAppointments.filter(apt => {
        const aptDate = parseISO(apt.date);
        return isWithinInterval(aptDate, { start, end });
      }).length;
    };

    // Today
    const dayCount = completedAppointments.filter(apt => apt.date === format(today, 'yyyy-MM-dd')).length;
    
    // This week
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekCount = getCompletedInPeriod(weekStart, weekEnd);
    
    // This month
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthCount = getCompletedInPeriod(monthStart, monthEnd);
    
    // This year
    const yearStart = startOfYear(today);
    const yearEnd = endOfYear(today);
    const yearCount = getCompletedInPeriod(yearStart, yearEnd);

    return {
      day: { count: dayCount, revenue: dayCount * averageValue },
      week: { count: weekCount, revenue: weekCount * averageValue },
      month: { count: monthCount, revenue: monthCount * averageValue },
      year: { count: yearCount, revenue: yearCount * averageValue },
    };
  }, [completedAppointments, averageValue]);

  const chartData = useMemo(() => {
    return [
      { name: 'Hoje', value: revenueData.day.revenue },
      { name: 'Semana', value: revenueData.week.revenue },
      { name: 'Mês', value: revenueData.month.revenue },
      { name: 'Ano', value: revenueData.year.revenue },
    ];
  }, [revenueData]);

  const chartConfig = {
    value: {
      label: 'Faturação',
      color: 'oklch(var(--chart-1))',
    },
  };

  const activeData = revenueData[activePeriod];

  // Calculate percentage change (mock for now)
  const percentageChange = 12.5;

  return (
    <Card className="p-6 bg-card border border-border shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
            <Euro className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-foreground text-lg">
              Faturação Estimada
            </h3>
            <p className="font-mono text-xs text-muted-foreground">
              Baseado em {averageValue}€/consulta
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="font-mono text-sm px-3 py-1 flex items-center gap-1 w-fit">
          <TrendingUp className="h-3 w-3 text-chart-1" />
          +{percentageChange}%
        </Badge>
      </div>

      {/* Period Toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
        {(Object.keys(periodLabels) as Period[]).map((period) => (
          <Button
            key={period}
            variant="ghost"
            size="sm"
            onClick={() => setActivePeriod(period)}
            className={`flex-1 font-sans text-sm ${
              activePeriod === period
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {periodLabels[period]}
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="font-mono text-3xl lg:text-4xl font-semibold text-primary">
            {activeData.revenue.toLocaleString('pt-PT')}€
          </p>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            {periodLabels[activePeriod]}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="font-mono text-3xl lg:text-4xl font-semibold text-foreground">
            {activeData.count}
          </p>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Consultas concluídas
          </p>
        </div>
      </div>

      {/* Futuristic Chart */}
      <div className="h-48 bg-muted/30 rounded-lg p-4 border border-border/50">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'oklch(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'oklch(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}€`}
              width={50}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`${value.toLocaleString('pt-PT')}€`, 'Faturação']}
            />
            <Area 
              type="monotone"
              dataKey="value" 
              stroke="oklch(var(--chart-1))"
              strokeWidth={2}
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </Card>
  );
}