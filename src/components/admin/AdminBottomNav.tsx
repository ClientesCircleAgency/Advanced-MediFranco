import { NavLink, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  Home,
  Inbox,
  Menu,
  Plus,
  Users,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useClinic } from '@/context/ClinicContext';
import { useAppointmentRequests } from '@/hooks/useAppointmentRequests';
import { useOnlineAppointments } from '@/hooks/useOnlineAppointments';

const navItems = [
  { path: '/admin/dashboard', label: 'Hoje', icon: Home },
  { path: '/admin/agenda', label: 'Agenda', icon: CalendarDays, badgeKey: 'todayLoad' },
  { path: '/admin/pedidos', label: 'Pedidos', icon: Inbox, badgeKey: 'requests' },
  { path: '/admin/pacientes', label: 'Pacientes', icon: Users },
  { path: '/admin/sala-espera', label: 'Fluxo', icon: Workflow, badgeKey: 'activeFlow' },
];

interface AdminBottomNavProps {
  onNewAppointment: () => void;
  onOpenMenu: () => void;
}

export function AdminBottomNav({ onNewAppointment, onOpenMenu }: AdminBottomNavProps) {
  const location = useLocation();
  const { appointments } = useClinic();
  const { data: requests = [] } = useAppointmentRequests();
  const { data: onlineAppointments = [] } = useOnlineAppointments();

  const todayDate = new Date().toISOString().split('T')[0];
  const todayLoad = appointments.filter(
    (appointment) =>
      appointment.date === todayDate &&
      ['scheduled', 'confirmed', 'pre_confirmed', 'waiting', 'in_progress'].includes(appointment.status)
  ).length + onlineAppointments.filter(
    (appointment) =>
      appointment.date === todayDate &&
      ['scheduled', 'pre_confirmed', 'confirmed', 'paid', 'waiting', 'in_progress'].includes(appointment.status)
  ).length;
  const pendingRequests = requests.filter((request) => request.status === 'pending').length;
  const activeFlow = appointments.filter(
    (appointment) => appointment.date === todayDate && ['waiting', 'in_progress'].includes(appointment.status)
  ).length;

  const getBadge = (badgeKey?: string) => {
    if (badgeKey === 'todayLoad' && todayLoad > 0) return todayLoad;
    if (badgeKey === 'requests' && pendingRequests > 0) return pendingRequests;
    if (badgeKey === 'activeFlow' && activeFlow > 0) return activeFlow;
    return null;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-2xl shadow-slate-950/15 backdrop-blur-xl lg:hidden">
      <Button
        type="button"
        aria-label="Criar nova consulta"
        onClick={onNewAppointment}
        className="absolute left-1/2 top-0 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-gradient p-0 text-white shadow-xl shadow-cyan-950/25 hover:opacity-95"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <nav className="mx-auto grid max-w-lg grid-cols-7 items-end gap-1">
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          const badge = getBadge(item.badgeKey);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex min-h-[3.75rem] flex-col items-center justify-center rounded-2xl px-1 text-[11px] font-medium transition-colors',
                isActive ? 'bg-cyan-50 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
              )}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span>{item.label}</span>
              {badge && (
                <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[10px] text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="min-h-[3.75rem]" aria-hidden="true" />

        {navItems.slice(3).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          const badge = getBadge(item.badgeKey);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex min-h-[3.75rem] flex-col items-center justify-center rounded-2xl px-1 text-[11px] font-medium transition-colors',
                isActive ? 'bg-cyan-50 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
              )}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span>{item.label}</span>
              {badge && (
                <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[10px] text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <button
          type="button"
          aria-label="Abrir menu"
          onClick={onOpenMenu}
          className="relative flex min-h-[3.75rem] flex-col items-center justify-center rounded-2xl px-1 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          <Menu className="mb-1 h-5 w-5" />
          <span>Mais</span>
        </button>
      </nav>
    </div>
  );
}
