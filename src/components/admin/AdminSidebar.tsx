import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Inbox,
  BarChart3,
  Newspaper,
  MonitorPlay,
  MessageSquareMore,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useClinic } from '@/context/ClinicContext';
import { useAppointmentRequests } from '@/hooks/useAppointmentRequests';
import { useOnlineAppointments } from '@/hooks/useOnlineAppointments';
import { PlanBadge } from './PlanBadge';

const navSections = [
  {
    label: 'Command Center',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/agenda', label: 'Agenda Hibrida', icon: CalendarDays, badgeKey: 'todayLoad' },
      { path: '/admin/pedidos', label: 'Triage e Pedidos', icon: Inbox, badgeKey: 'requests' },
      { path: '/admin/sala-espera', label: 'Fluxo Clinico', icon: Workflow, badgeKey: 'activeFlow' },
    ],
  },
  {
    label: 'Operacao',
    items: [
      { path: '/admin/pacientes', label: 'Pacientes', icon: Users },
      { path: '/admin/mensagens', label: 'Mensagens', icon: MessageSquareMore, badgeKey: 'messages' },
      { path: '/admin/blog', label: 'Site e Blog', icon: Newspaper },
      { path: '/admin/estatisticas', label: 'Analytics', icon: BarChart3 },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewAppointment: () => void;
  onLogout: () => void;
  isMobile?: boolean;
}

export function AdminSidebar({ collapsed, onToggle, onNewAppointment, onLogout, isMobile = false }: AdminSidebarProps) {
  const location = useLocation();
  const { appointments } = useClinic();
  const { data: requests = [] } = useAppointmentRequests();
  const { data: onlineAppointments = [] } = useOnlineAppointments();

  const todayDate = new Date().toISOString().split('T')[0];
  const pendingToday = appointments.filter(
    (appointment) => appointment.date === todayDate && ['scheduled', 'confirmed', 'pre_confirmed'].includes(appointment.status)
  ).length;
  const onlineToday = onlineAppointments.filter(
    (appointment) => appointment.date === todayDate && ['scheduled', 'pre_confirmed', 'confirmed', 'paid'].includes(appointment.status)
  ).length;
  const pendingRequests = requests.filter((request) => request.status === 'pending').length;
  const activeFlow = appointments.filter(
    (appointment) => appointment.date === todayDate && ['waiting', 'in_progress'].includes(appointment.status)
  ).length;
  const unreadMessages = 0;
  const isCollapsed = collapsed && !isMobile;

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-white/10 bg-slate-950/95 text-slate-100 backdrop-blur-xl',
        isMobile
          ? 'h-full w-full'
          : 'fixed left-0 top-20 z-40 h-[calc(100vh-5rem)] transition-all duration-300',
        !isMobile && (isCollapsed ? 'w-16' : 'w-72')
      )}
    >
      <div className="px-3 py-3">
        <PlanBadge plan="advanced" collapsed={isCollapsed} />
      </div>

      {!isCollapsed && (
        <div className="mx-3 mb-3 rounded-[1.75rem] border border-cyan-400/10 bg-white/5 px-3 py-3 shadow-lg shadow-cyan-950/20">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">
            <MonitorPlay className="h-3.5 w-3.5" />
            Operacao Hibrida
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-slate-900/90 p-3">
              <p className="font-mono text-lg text-white">{pendingToday}</p>
              <p className="mt-1 text-[11px] text-slate-400">Presencial hoje</p>
            </div>
            <div className="rounded-2xl bg-slate-900/90 p-3">
              <p className="font-mono text-lg text-cyan-300">{onlineToday}</p>
              <p className="mt-1 text-[11px] text-slate-400">Online hoje</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-3">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewAppointment}
                size="icon"
                className="w-full rounded-2xl bg-primary-gradient font-sans shadow-md hover:opacity-90"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Nova consulta</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            onClick={onNewAppointment}
            className="w-full gap-2 rounded-2xl bg-primary-gradient font-sans font-medium shadow-md transition-all hover:opacity-90 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Nova consulta
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                const Icon = item.icon;
                const badge =
                  item.badgeKey === 'requests' && pendingRequests > 0
                    ? pendingRequests
                    : item.badgeKey === 'todayLoad' && pendingToday + onlineToday > 0
                      ? pendingToday + onlineToday
                      : item.badgeKey === 'activeFlow' && activeFlow > 0
                        ? activeFlow
                        : item.badgeKey === 'messages' && unreadMessages > 0
                          ? unreadMessages
                          : null;

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.path}
                          className={cn(
                            'relative flex h-11 w-full items-center justify-center rounded-2xl transition-all',
                            isActive
                              ? 'bg-white text-slate-950 shadow-lg shadow-cyan-950/20'
                              : 'text-slate-400 hover:bg-white/8 hover:text-white'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {badge && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 font-mono text-[10px] text-slate-950">
                              {badge}
                            </span>
                          )}
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-sans text-xs">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all',
                      isActive
                        ? 'bg-white text-slate-950 shadow-lg shadow-cyan-950/20'
                        : 'text-slate-300 hover:bg-white/8 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {badge && (
                      <span
                        className={cn(
                          'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px]',
                          isActive ? 'bg-slate-950 text-cyan-300' : 'bg-cyan-400/20 text-cyan-200'
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-1">
        <div className="border-t border-white/10" />
      </div>

      <div className="space-y-1 p-3">
        {isCollapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/admin/configuracoes"
                  className={cn(
                    'flex h-10 w-full items-center justify-center rounded-2xl transition-all',
                    location.pathname === '/admin/configuracoes'
                      ? 'bg-white text-slate-950'
                      : 'text-slate-400 hover:bg-white/8 hover:text-white'
                  )}
                >
                  <Settings className="h-4 w-4" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-sans text-xs">
                Configuracoes
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="h-10 w-full rounded-2xl text-red-300 hover:bg-red-500/10 hover:text-red-200"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-sans text-xs">
                Sair
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <NavLink
              to="/admin/configuracoes"
              className={cn(
                'flex h-10 items-center gap-3 rounded-2xl px-3 font-sans text-sm transition-all',
                location.pathname === '/admin/configuracoes'
                  ? 'bg-white text-slate-950 font-medium'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Configuracoes</span>
            </NavLink>
            <button
              onClick={onLogout}
              className="flex h-10 w-full items-center gap-3 rounded-2xl px-3 font-sans text-sm text-red-300 transition-all hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </>
        )}
      </div>

      {!isMobile && (
        <div className="border-t border-white/10 p-3">
          <button
            onClick={onToggle}
            className={cn(
              'flex h-9 w-full items-center rounded-2xl text-xs text-slate-400 transition-all hover:bg-white/8 hover:text-white',
              isCollapsed ? 'justify-center' : 'justify-start gap-2 px-3'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Recolher</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
