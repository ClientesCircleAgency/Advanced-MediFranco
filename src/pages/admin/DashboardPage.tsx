import { CalendarDays, Euro, Star, RefreshCw, Send, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { useAppointmentRequests } from '@/hooks/useAppointmentRequests';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { appointments, patients } = useClinic();
  const { data: requests = [] } = useAppointmentRequests();
  
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter((a) => a.date === todayDate);
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Consultas Hoje */}
        <Card className="p-4 lg:p-5 bg-card border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-muted flex items-center justify-center">
              <CalendarDays className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-3 lg:mt-4">
            <p className="text-2xl lg:text-3xl font-bold text-foreground">{todayAppointments.length}</p>
            <p className="text-xs lg:text-sm text-muted-foreground">Consultas Hoje</p>
          </div>
        </Card>

        {/* Pedidos Pendentes */}
        <Link to="/admin/pedidos">
          <Card className="p-4 lg:p-5 bg-card border-primary/30 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Inbox className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              </div>
              {pendingRequests.length > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs">
                  Novo
                </Badge>
              )}
            </div>
            <div className="mt-3 lg:mt-4">
              <p className="text-2xl lg:text-3xl font-bold text-foreground">{pendingRequests.length}</p>
              <p className="text-xs lg:text-sm text-muted-foreground">Pedidos Pendentes</p>
            </div>
          </Card>
        </Link>

        {/* Pacientes */}
        <Card className="p-4 lg:p-5 bg-card border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-muted flex items-center justify-center">
              <Star className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-3 lg:mt-4">
            <p className="text-2xl lg:text-3xl font-bold text-foreground">{patients.length}</p>
            <p className="text-xs lg:text-sm text-muted-foreground">Pacientes Registados</p>
          </div>
        </Card>

        {/* Total Consultas */}
        <Card className="p-4 lg:p-5 bg-card border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-muted flex items-center justify-center">
              <RefreshCw className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-3 lg:mt-4">
            <p className="text-2xl lg:text-3xl font-bold text-foreground">{appointments.length}</p>
            <p className="text-xs lg:text-sm text-muted-foreground">Total Consultas</p>
          </div>
        </Card>
      </div>

      {/* Grid de cards inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Próximas Consultas */}
        <Card className="p-4 lg:p-5 bg-card border-border">
          <h3 className="font-semibold text-foreground text-sm lg:text-base mb-3 lg:mb-4">Consultas de Hoje</h3>
          <div className="space-y-2 lg:space-y-3">
            {todayAppointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center gap-3 p-2.5 lg:p-3 rounded-lg bg-muted/30">
                <div className="text-base lg:text-lg font-mono font-medium text-foreground w-12 lg:w-14">
                  {apt.time}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-xs lg:text-sm truncate">Consulta agendada</p>
                  <p className="text-xs text-muted-foreground truncate">{apt.duration} minutos</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'waiting' ? 'Em espera' : 'Agendado'}
                </Badge>
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <p className="text-muted-foreground text-xs lg:text-sm text-center py-6 lg:py-8">
                Nenhuma consulta agendada para hoje
              </p>
            )}
          </div>
        </Card>

        {/* Pedidos Recentes */}
        <Card className="p-4 lg:p-5 bg-card border-border">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h3 className="font-semibold text-foreground text-sm lg:text-base">Pedidos Recentes</h3>
            <Link to="/admin/pedidos" className="text-xs text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-2 lg:space-y-3">
            {pendingRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center gap-3 p-2.5 lg:p-3 rounded-lg bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm text-foreground truncate">{req.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.service_type === 'oftalmologia' ? 'Oftalmologia' : 'Dentária'} • {format(new Date(req.preferred_date), "d MMM", { locale: pt })}
                  </p>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <p className="text-muted-foreground text-xs lg:text-sm text-center py-6 lg:py-8">
                Nenhum pedido pendente
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
