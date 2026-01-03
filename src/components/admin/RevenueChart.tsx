import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';

type Period = 'day' | 'week' | 'month' | 'year';

const periodLabels: Record<Period, string> = {
  day: 'Hoje',
  week: 'Esta Semana',
  month: 'Este Mês',
  year: 'Este Ano',
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
      { name: 'Hoje', value: revenueData.day.revenue, fill: 'hsl(var(--primary))' },
      { name: 'Semana', value: revenueData.week.revenue, fill: 'hsl(var(--primary) / 0.8)' },
      { name: 'Mês', value: revenueData.month.revenue, fill: 'hsl(var(--primary) / 0.6)' },
      { name: 'Ano', value: revenueData.year.revenue, fill: 'hsl(var(--primary) / 0.4)' },
    ];
  }, [revenueData]);

  const chartConfig = {
    value: {
      label: 'Faturação',
      color: 'hsl(var(--primary))',
    },
  };

  const activeData = revenueData[activePeriod];

  return (
    <Card className="p-4 lg:p-5 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Euro className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm lg:text-base">Faturação Estimada</h3>
            <p className="text-xs text-muted-foreground">Baseado em {averageValue}€/consulta</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      {/* Period Toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
        {(Object.keys(periodLabels) as Period[]).map((period) => (
          <Button
            key={period}
            variant="ghost"
            size="sm"
            onClick={() => setActivePeriod(period)}
            className={`flex-1 text-xs ${
              activePeriod === period
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {periodLabels[period]}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-2xl lg:text-3xl font-bold text-foreground">
            {activeData.revenue.toLocaleString('pt-PT')}€
          </p>
          <p className="text-xs text-muted-foreground">{periodLabels[activePeriod]}</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-2xl lg:text-3xl font-bold text-foreground">
            {activeData.count}
          </p>
          <p className="text-xs text-muted-foreground">Consultas concluídas</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}€`}
              className="text-muted-foreground"
              width={45}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`${value.toLocaleString('pt-PT')}€`, 'Faturação']}
            />
            <Bar 
              dataKey="value" 
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
