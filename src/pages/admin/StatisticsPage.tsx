import { useState, useMemo } from 'react';
import { format, startOfWeek, startOfMonth, startOfYear, subDays, eachDayOfInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import { BarChart3, Calendar, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClinic } from '@/context/ClinicContext';

type Period = 'today' | 'week' | 'month' | 'year';

export default function StatisticsPage() {
    const { appointments } = useClinic();
    const [period, setPeriod] = useState<Period>('month');

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

        // Filter appointments by period
        const periodAppointments = appointments.filter(apt => apt.date >= startDateStr);

        // Total appointments
        const total = periodAppointments.length;

        // By status
        const confirmed = periodAppointments.filter(a => a.status === 'confirmed').length;
        const completed = periodAppointments.filter(a => a.status === 'completed').length;
        const cancelled = periodAppointments.filter(a => a.status === 'cancelled').length;
        const pending = periodAppointments.filter(a => a.status === 'scheduled').length;

        // Attendance rate (completed vs total non-cancelled)
        const totalNonCancelled = total - cancelled;
        const attendanceRate = totalNonCancelled > 0 ? (completed / totalNonCancelled) * 100 : 0;

        // By time of day
        const byHour = periodAppointments.reduce((acc, apt) => {
            const hour = apt.time.split(':')[0];
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // By day of week
        const byDayOfWeek = periodAppointments.reduce((acc, apt) => {
            const date = new Date(apt.date);
            const dayName = format(date, 'EEEE', { locale: pt });
            acc[dayName] = (acc[dayName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Trend over last 7 days (for chart)
        const last7Days = eachDayOfInterval({
            start: subDays(now, 6),
            end: now
        });

        const trendData = last7Days.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const count = appointments.filter(a => a.date === dateStr).length;
            return {
                date: format(date, 'dd/MM'),
                count
            };
        });

        return {
            total,
            confirmed,
            completed,
            cancelled,
            pending,
            attendanceRate,
            byHour,
            byDayOfWeek,
            trendData
        };
    }, [appointments, period]);

    const getPeriodLabel = () => {
        switch (period) {
            case 'today': return 'Hoje';
            case 'week': return 'Esta Semana';
            case 'month': return 'Este Mês';
            case 'year': return 'Este Ano';
        }
    };

    return (
        <div className="space-y-4 lg:space-y-6">
            <PageHeader
                title="Estatísticas de Marcações"
                subtitle="Análise de volume e performance das consultas"
            />

            {/* Period Selector */}
            <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <TabsList className="grid w-full grid-cols-4 max-w-md">
                    <TabsTrigger value="today">Hoje</TabsTrigger>
                    <TabsTrigger value="week">Semana</TabsTrigger>
                    <TabsTrigger value="month">Mês</TabsTrigger>
                    <TabsTrigger value="year">Ano</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Appointments */}
                <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total de Marcações</p>
                    <p className="text-xs text-muted-foreground mt-1">{getPeriodLabel()}</p>
                </Card>

                {/* Attendance Rate */}
                <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.attendanceRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Taxa de Comparecimento</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.completed} completadas</p>
                </Card>

                {/* Confirmed */}
                <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.confirmed}</p>
                    <p className="text-sm text-muted-foreground mt-1">Confirmadas</p>
                    <p className="text-xs text-muted-foreground mt-1">Aguardam consulta</p>
                </Card>

                {/* Cancelled */}
                <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.cancelled}</p>
                    <p className="text-sm text-muted-foreground mt-1">Canceladas</p>
                    <p className="text-xs text-muted-foreground mt-1">{((stats.cancelled / stats.total) * 100 || 0).toFixed(1)}% do total</p>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Trend Chart */}
                <Card className="p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Tendência (Últimos 7 Dias)</h3>
                    </div>
                    <div className="space-y-2">
                        {stats.trendData.map((day, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-12">{day.date}</span>
                                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                                    <div
                                        className="bg-primary h-full rounded-full transition-all"
                                        style={{ width: `${(day.count / Math.max(...stats.trendData.map(d => d.count), 1)) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-foreground w-8 text-right">{day.count}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* By Status */}
                <Card className="p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Por Estado</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-sm text-foreground">Completadas</span>
                            </div>
                            <span className="text-sm font-medium">{stats.completed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-sm text-foreground">Confirmadas</span>
                            </div>
                            <span className="text-sm font-medium">{stats.confirmed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span className="text-sm text-foreground">Pendentes</span>
                            </div>
                            <span className="text-sm font-medium">{stats.pending}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-sm text-foreground">Canceladas</span>
                            </div>
                            <span className="text-sm font-medium">{stats.cancelled}</span>
                        </div>
                    </div>
                </Card>

                {/* By Day of Week */}
                <Card className="p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Por Dia da Semana</h3>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(stats.byDayOfWeek).map(([day, count]) => (
                            <div key={day} className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-20 capitalize">{day}</span>
                                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                                    <div
                                        className="bg-primary h-full rounded-full transition-all"
                                        style={{ width: `${(count / Math.max(...Object.values(stats.byDayOfWeek), 1)) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-foreground w-8 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* By Hour */}
                <Card className="p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Horários Mais Populares</h3>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {Object.entries(stats.byHour)
                            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                            .map(([hour, count]) => (
                                <div key={hour} className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground w-12">{hour}:00</span>
                                    <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                                        <div
                                            className="bg-primary h-full rounded-full transition-all"
                                            style={{ width: `${(count / Math.max(...Object.values(stats.byHour), 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-foreground w-8 text-right">{count}</span>
                                </div>
                            ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
