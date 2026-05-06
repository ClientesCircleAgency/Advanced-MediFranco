import { useState, useMemo } from 'react';
import { format, startOfWeek, startOfMonth, startOfYear, subDays, eachDayOfInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import { BarChart3, Calendar, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClinic } from '@/context/ClinicContext';
import { cn } from '@/lib/utils';

type Period = 'today' | 'week' | 'month' | 'year';

const shellCardClassName =
  'rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-cyan-950/5 backdrop-blur-sm';

export default function StatisticsPage() {
  const { appointments } = useClinic();
  const [period, setPeriod] = useState<Period>('month');

  const activeAppointments = useMemo(() => {
    return appointments.filter((appointment) => ['scheduled', 'confirmed', 'completed'].includes(appointment.status));
  }, [appointments]);

  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = now;
        break;
      case 'week':
        startDate = startOfWeek(now, { locale: pt });
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        break;
    }

    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const periodAppointments = activeAppointments.filter((appointment) => appointment.date >= startDateStr);
    const total = periodAppointments.length;
    const confirmed = periodAppointments.filter((appointment) => appointment.status === 'confirmed').length;
    const completed = periodAppointments.filter((appointment) => appointment.status === 'completed').length;
    const pending = periodAppointments.filter((appointment) => appointment.status === 'scheduled').length;

    const byHour = periodAppointments.reduce((accumulator, appointment) => {
      const hour = appointment.time.split(':')[0];
      accumulator[hour] = (accumulator[hour] || 0) + 1;
      return accumulator;
    }, {} as Record<string, number>);

    const byDayOfWeek = periodAppointments.reduce((accumulator, appointment) => {
      const date = new Date(appointment.date);
      const dayName = format(date, 'EEEE', { locale: pt });
      accumulator[dayName] = (accumulator[dayName] || 0) + 1;
      return accumulator;
    }, {} as Record<string, number>);

    const last7Days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    });

    const trendData = last7Days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = activeAppointments.filter((appointment) => appointment.date === dateStr).length;
      return {
        date: format(date, 'dd/MM'),
        count,
      };
    });

    return {
      total,
      confirmed,
      completed,
      pending,
      byHour,
      byDayOfWeek,
      trendData,
    };
  }, [activeAppointments, period]);

  const getPeriodLabel = () => {
    switch (period) {
      case 'today':
        return 'Hoje';
      case 'week':
        return 'Esta semana';
      case 'month':
        return 'Este mês';
      case 'year':
        return 'Este ano';
    }
  };

  const renderBars = (entries: [string, number][], formatter?: (label: string) => string) => {
    const maxValue = Math.max(...entries.map((entry) => entry[1]), 1);

    return (
      <div className="space-y-3">
        {entries.map(([label, count]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-20 text-xs text-slate-500">{formatter ? formatter(label) : label}</span>
            <div className="h-7 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500" style={{ width: `${(count / maxValue) * 100}%` }} />
            </div>
            <span className="w-8 text-right text-sm font-medium text-slate-900">{count}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Analytics Surface"
        title="Estatísticas"
        subtitle="Leitura mais limpa da operação clínica, com margens consistentes e melhor ergonomia em mobile."
      />

      <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)} className="w-full">
        <TabsList className="grid h-auto w-full max-w-xl grid-cols-4 rounded-[1.5rem] border border-slate-200 bg-white/85 p-1.5 shadow-sm">
          <TabsTrigger value="today" className="rounded-[1rem] px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white">Hoje</TabsTrigger>
          <TabsTrigger value="week" className="rounded-[1rem] px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white">Semana</TabsTrigger>
          <TabsTrigger value="month" className="rounded-[1rem] px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white">Mês</TabsTrigger>
          <TabsTrigger value="year" className="rounded-[1rem] px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white">Ano</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, hint: getPeriodLabel(), icon: Calendar, tone: 'bg-cyan-50 text-cyan-700' },
          { label: 'Pendentes', value: stats.pending, hint: 'Aguardam aprovação', icon: AlertCircle, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Confirmadas', value: stats.confirmed, hint: 'Agendadas', icon: Clock, tone: 'bg-violet-50 text-violet-700' },
          { label: 'Concluídas', value: stats.completed, hint: 'Realizadas', icon: CheckCircle, tone: 'bg-emerald-50 text-emerald-700' },
        ].map((item) => (
          <div key={item.label} className={cn(shellCardClassName, 'p-5')}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 font-display text-4xl text-slate-950">{item.value}</p>
              </div>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', item.tone)}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-700" />
            <h3 className="font-display text-lg font-semibold text-slate-950">Tendência dos últimos 7 dias</h3>
          </div>
          {renderBars(stats.trendData.map((item) => [item.date, item.count]))}
        </div>

        <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-700" />
            <h3 className="font-display text-lg font-semibold text-slate-950">Por estado</h3>
          </div>
          <div className="space-y-3">
            {[
              ['Concluídas', stats.completed, 'bg-emerald-500'],
              ['Confirmadas', stats.confirmed, 'bg-violet-500'],
              ['Pendentes', stats.pending, 'bg-amber-500'],
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={cn('h-3 w-3 rounded-full', color)} />
                  <span className="text-sm text-slate-700">{label}</span>
                </div>
                <span className="text-sm font-medium text-slate-950">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
          <div className="mb-5 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-700" />
            <h3 className="font-display text-lg font-semibold text-slate-950">Por dia da semana</h3>
          </div>
          {renderBars(Object.entries(stats.byDayOfWeek), (label) => label)}
        </div>

        <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
          <div className="mb-5 flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-700" />
            <h3 className="font-display text-lg font-semibold text-slate-950">Horários mais populares</h3>
          </div>
          <div className="max-h-80 overflow-y-auto pr-1">
            {renderBars(
              Object.entries(stats.byHour).sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10)),
              (label) => `${label}:00`
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
