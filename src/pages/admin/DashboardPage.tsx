import { CalendarDays, Users, TrendingUp, Clock, Inbox, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { useAppointmentRequests } from '@/hooks/useAppointmentRequests';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { RevenueChart } from '@/components/admin/RevenueChart';
import type { AppointmentStatus } from '@/types/clinic';

export default function DashboardPage() {
  const { appointments, patients } = useClinic();
  const { data: requests = [] } = useAppointmentRequests();
  
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter((a) => a.date === todayDate);
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const currentDate = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt });

  return (
    <div className="space-y-6">
      {/* Sophisticated Header */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <p className="font-serif italic text-foreground text-xl lg:text-2xl">
          Bem-vindo de volta, Dr. Franco
        </p>
        <p className="font-mono text-xs text-muted-foreground mt-1 uppercase tracking-wide">
          {currentDate}
        </p>
      </div>

      {/* HUD-style KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Consultas Hoje */}
        <Card className="p-5 bg-card border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-4 right-4">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="font-mono text-4xl lg:text-5xl font-semibold text-primary tracking-tight">
              {todayAppointments.length}
            </p>
            <p className="text-sm font-sans font-medium text-foreground">
              Consultas Hoje
            </p>
          </div>
        </Card>

        {/* Pedidos Pendentes */}
        <Link to="/admin/pedidos" className="block">
          <Card className="p-5 bg-card border border-primary/30 shadow-sm relative overflow-hidden group hover:shadow-md transition-all cursor-pointer h-full">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {pendingRequests.length > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5">
                  Novo
                </Badge>
              )}
              <Inbox className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="font-mono text-4xl lg:text-5xl font-semibold text-primary tracking-tight">
                {pendingRequests.length}
              </p>
              <p className="text-sm font-sans font-medium text-foreground">
                Pedidos Pendentes
              </p>
            </div>
          </Card>
        </Link>

        {/* Pacientes Registados */}
        <Card className="p-5 bg-card border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-4 right-4">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="font-mono text-4xl lg:text-5xl font-semibold text-foreground tracking-tight">
              {patients.length}
            </p>
            <p className="text-sm font-sans font-medium text-foreground">
              Pacientes Registados
            </p>
          </div>
        </Card>

        {/* Total Consultas */}
        <Card className="p-5 bg-card border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-4 right-4">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="font-mono text-4xl lg:text-5xl font-semibold text-foreground tracking-tight">
              {appointments.length}
            </p>
            <p className="text-sm font-sans font-medium text-foreground">
              Total Consultas
            </p>
          </div>
        </Card>
      </div>

      {/* Revenue Chart - Full Width */}
      <RevenueChart />

      {/* Bottom Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultas de Hoje */}
        <Card className="p-5 bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-sans font-semibold text-foreground">
                Consultas de Hoje
              </h3>
            </div>
            <Link to="/admin/agenda" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver agenda
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {todayAppointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="font-mono text-sm font-medium text-primary shrink-0 w-12">
                  {apt.time.slice(0, 5)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium text-foreground text-sm truncate">
                    Consulta agendada
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {apt.duration} min
                  </p>
                </div>
                <StatusBadge status={apt.status as AppointmentStatus} size="sm" className="shrink-0" />
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <div className="py-8 text-center bg-muted/30 rounded-lg border border-border/50">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm font-sans">
                  Nenhuma consulta agendada para hoje
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Pedidos Recentes */}
        <Card className="p-5 bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Inbox className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-sans font-semibold text-foreground">
                Pedidos Recentes
              </h3>
            </div>
            <Link to="/admin/pedidos" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todos
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {pendingRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="w-2 h-2 rounded-full bg-chart-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-foreground truncate">
                    {req.name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {req.service_type === 'oftalmologia' ? 'Oftalmologia' : 'Dentária'} • {format(new Date(req.preferred_date), "d MMM", { locale: pt })}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                  Pendente
                </Badge>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="py-8 text-center bg-muted/30 rounded-lg border border-border/50">
                <Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm font-sans">
                  Nenhum pedido pendente
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}