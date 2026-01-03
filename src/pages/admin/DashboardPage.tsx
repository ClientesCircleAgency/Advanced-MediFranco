import { CalendarDays, Users, TrendingUp, Clock, Inbox, ArrowUpRight, Star, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { useAppointmentRequests } from '@/hooks/useAppointmentRequests';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { AppointmentStatus } from '@/types/clinic';

export default function DashboardPage() {
  const { appointments, patients } = useClinic();
  const { data: requests = [] } = useAppointmentRequests();
  
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter((a) => a.date === todayDate);
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const currentDate = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt });

  // Mock data for Google rating (would come from API)
  const googleRating = 4.8;
  const totalReviews = 127;

  // Mock data for chatbot bookings today (resets at 00:00)
  const chatbotBookingsToday = 3;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Minimal Header */}
      <div className="text-center md:text-left">
        <p className="font-serif italic text-foreground text-xl md:text-2xl">
          Bem-vindo de volta, Dr. Franco
        </p>
        <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
          {currentDate}
        </p>
      </div>

      {/* Compact Square KPI Cards - Fixed size, centered */}
      <div className="flex flex-wrap justify-center gap-3">
        {/* Consultas Hoje */}
        <div className="bg-card border border-border rounded-xl w-24 h-24 md:w-28 md:h-28 p-3 shadow-sm flex flex-col justify-between">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          <div>
            <p className="font-mono text-xl md:text-2xl font-semibold text-primary leading-none">
              {todayAppointments.length}
            </p>
            <p className="text-[8px] md:text-[9px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">
              Hoje
            </p>
          </div>
        </div>

        {/* Pedidos Pendentes */}
        <Link to="/admin/pedidos" className="block">
          <div className="bg-card border border-border rounded-xl w-24 h-24 md:w-28 md:h-28 p-3 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <Inbox className="h-3.5 w-3.5 text-primary" />
              {pendingRequests.length > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
              )}
            </div>
            <div>
              <p className="font-mono text-xl md:text-2xl font-semibold text-primary leading-none">
                {pendingRequests.length}
              </p>
              <p className="text-[8px] md:text-[9px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">
                Pedidos
              </p>
            </div>
          </div>
        </Link>

        {/* Pacientes Registados */}
        <div className="bg-card border border-border rounded-xl w-24 h-24 md:w-28 md:h-28 p-3 shadow-sm flex flex-col justify-between">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="font-mono text-xl md:text-2xl font-semibold text-foreground leading-none">
              {patients.length}
            </p>
            <p className="text-[8px] md:text-[9px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">
              Pacientes
            </p>
          </div>
        </div>

        {/* Total Consultas */}
        <div className="bg-card border border-border rounded-xl w-24 h-24 md:w-28 md:h-28 p-3 shadow-sm flex flex-col justify-between">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="font-mono text-xl md:text-2xl font-semibold text-foreground leading-none">
              {appointments.length}
            </p>
            <p className="text-[8px] md:text-[9px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">
              Total
            </p>
          </div>
        </div>

        {/* Google Rating */}
        <div className="bg-card border border-border rounded-xl w-24 h-24 md:w-28 md:h-28 p-3 shadow-sm flex flex-col justify-between">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <div>
            <div className="flex items-baseline gap-0.5">
              <p className="font-mono text-xl md:text-2xl font-semibold text-foreground leading-none">
                {googleRating}
              </p>
              <span className="text-[8px] text-muted-foreground">/5</span>
            </div>
            <p className="text-[8px] md:text-[9px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">
              Google
            </p>
          </div>
        </div>

        {/* Chatbot Bookings Today */}
        <div className="bg-card border border-border rounded-xl w-24 h-24 md:w-28 md:h-28 p-3 shadow-sm flex flex-col justify-between">
          <Bot className="h-3.5 w-3.5 text-primary" />
          <div>
            <p className="font-mono text-xl md:text-2xl font-semibold text-primary leading-none">
              {chatbotBookingsToday}
            </p>
            <p className="text-[8px] md:text-[9px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">
              Chatbot
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Cards Grid */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        {/* Consultas de Hoje */}
        <div className="bg-card border border-border rounded-xl p-4 lg:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm lg:text-base text-foreground">
                Consultas de Hoje
              </h3>
            </div>
            <Link to="/admin/agenda" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {todayAppointments.slice(0, 4).map((apt) => (
              <div key={apt.id} className="flex items-center gap-3 p-2.5 lg:p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="font-mono text-xs lg:text-sm font-medium text-primary shrink-0 w-10 lg:w-12">
                  {apt.time.slice(0, 5)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-xs lg:text-sm truncate">
                    Consulta
                  </p>
                  <p className="font-mono text-[10px] lg:text-xs text-muted-foreground">
                    {apt.duration} min
                  </p>
                </div>
                <StatusBadge status={apt.status as AppointmentStatus} size="sm" className="shrink-0" />
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <div className="py-6 lg:py-8 text-center bg-muted/30 rounded-lg border border-border/50">
                <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-xs lg:text-sm">
                  Nenhuma consulta para hoje
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pedidos Recentes */}
        <div className="bg-card border border-border rounded-xl p-4 lg:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-accent flex items-center justify-center">
                <Inbox className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm lg:text-base text-foreground">
                Pedidos Recentes
              </h3>
            </div>
            <Link to="/admin/pedidos" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {pendingRequests.slice(0, 4).map((req) => (
              <div key={req.id} className="flex items-center gap-3 p-2.5 lg:p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-foreground truncate">
                    {req.name}
                  </p>
                  <p className="font-mono text-[10px] lg:text-xs text-muted-foreground">
                    {req.service_type === 'oftalmologia' ? 'Oftalmo' : 'Dentária'} • {format(new Date(req.preferred_date), "d MMM", { locale: pt })}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 font-mono text-[10px] lg:text-xs px-1.5">
                  Pendente
                </Badge>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="py-6 lg:py-8 text-center bg-muted/30 rounded-lg border border-border/50">
                <Inbox className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-xs lg:text-sm">
                  Nenhum pedido pendente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}