import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useClinic } from '@/context/ClinicContext';
import { useSettings } from '@/hooks/useSettings';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO, subMonths, eachDayOfInterval, subDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type Period = 'week' | 'month' | 'year';

const periodLabels: Record<Period, string> = {
  week: 'Últimos 7 dias',
  month: 'Últimos 30 dias',
  year: 'Últimos 3 meses',
};

export function RevenueChart() {
  const { appointments } = useClinic();
  const { data: settings } = useSettings();
  const [activePeriod, setActivePeriod] = useState<Period>('month');

  const averageValue = (settings?.averageConsultationValue as number) || 50;

  const completedAppointments = useMemo(() => {
    return appointments.filter(a => a.status === 'completed');
  }, [appointments]);

  const chartData = useMemo(() => {
    const today = new Date();
    let days: Date[] = [];

    if (activePeriod === 'week') {
      days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    } else if (activePeriod === 'month') {
      days = eachDayOfInterval({ start: subDays(today, 29), end: today });
    } else {
      days = eachDayOfInterval({ start: subMonths(today, 3), end: today });
    }

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = completedAppointments.filter(apt => apt.date === dateStr).length;
      return {
        date: format(day, activePeriod === 'year' ? 'dd MMM' : 'dd', { locale: pt }),
        revenue: count * averageValue,
        count,
      };
    });
  }, [completedAppointments, averageValue, activePeriod]);

  const totalRevenue = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.revenue, 0);
  }, [chartData]);

  const previousPeriodRevenue = useMemo(() => {
    const today = new Date();
    let start: Date, end: Date;

    if (activePeriod === 'week') {
      end = subDays(today, 7);
      start = subDays(today, 13);
    } else if (activePeriod === 'month') {
      end = subDays(today, 30);
      start = subDays(today, 59);
    } else {
      end = subMonths(today, 3);
      start = subMonths(today, 6);
    }

    const prevDays = eachDayOfInterval({ start, end });
    return prevDays.reduce((sum, day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = completedAppointments.filter(apt => apt.date === dateStr).length;
      return sum + count * averageValue;
    }, 0);
  }, [completedAppointments, averageValue, activePeriod]);

  const percentageChange = previousPeriodRevenue > 0
    ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
    : totalRevenue > 0 ? 100 : 0;

  const isPositive = percentageChange >= 0;

  return (
    <Card className="p-5 lg:p-6 bg-card border-border shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Faturação Total</p>
          <p className="text-3xl lg:text-4xl font-bold text-foreground mt-1">
            {totalRevenue.toLocaleString('pt-PT')}€
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
              isPositive 
                ? 'bg-accent text-primary' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? '+' : ''}{percentageChange.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              vs período anterior
            </span>
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex gap-1 p-0.5 bg-secondary rounded-lg">
          {(Object.keys(periodLabels) as Period[]).map((period) => (
            <Button
              key={period}
              variant="ghost"
              size="sm"
              onClick={() => setActivePeriod(period)}
              className={`text-xs px-3 py-1.5 h-auto ${
                activePeriod === period
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
              }`}
            >
              {period === 'week' ? '7 dias' : period === 'month' ? '30 dias' : '3 meses'}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickMargin={10}
              interval={activePeriod === 'week' ? 0 : activePeriod === 'month' ? 4 : 10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickFormatter={(value) => `${value}€`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
              formatter={(value: number) => [`${value.toLocaleString('pt-PT')}€`, 'Faturação']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={{ r: 0 }}
              activeDot={{
                r: 5,
                fill: 'var(--chart-1)',
                stroke: 'var(--card)',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
