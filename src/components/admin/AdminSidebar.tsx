import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageSquare,
  Armchair,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Inbox,
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
import { PlanBadge } from './PlanBadge';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { path: '/admin/pedidos', label: 'Pedidos', icon: Inbox, badgeKey: 'requests' },
  { path: '/admin/pacientes', label: 'Pacientes', icon: Users },
  { path: '/admin/mensagens', label: 'Mensagens', icon: MessageSquare },
  { path: '/admin/sala-espera', label: 'Sala de Espera', icon: Armchair },
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

  const todayDate = new Date().toISOString().split('T')[0];
  const pendingToday = appointments.filter(
    (a) => a.date === todayDate && (a.status === 'scheduled' || a.status === 'confirmed')
  ).length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  const isCollapsed = collapsed && !isMobile;

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col',
        isMobile ? 'w-full' : 'fixed left-0 top-0 z-40 transition-all duration-300',
        !isMobile && (isCollapsed ? 'w-16' : 'w-64')
      )}
    >
      {/* Logo - MediFranco */}
      <div className="h-14 lg:h-16 flex items-center px-4 border-b border-sidebar-border">
        {isCollapsed ? (
          <img 
            src="/logo-medifranco.png" 
            alt="MediFranco" 
            className="h-8 w-8 object-contain mx-auto"
          />
        ) : (
          <img 
            src="/logo-medifranco.png" 
            alt="MediFranco" 
            className="h-10 object-contain"
          />
        )}
      </div>

      {/* Plan Badge */}
      <div className="px-3 py-2">
        <PlanBadge plan="advanced" collapsed={isCollapsed} />
      </div>

      {/* Botão Nova Consulta */}
      <div className="p-3">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewAppointment}
                size="icon"
                className="w-full bg-primary hover:bg-primary/90 shadow-lg"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Nova Consulta</TooltipContent>
          </Tooltip>
        ) : (
          <Button 
            onClick={onNewAppointment} 
            className="w-full gap-2 bg-primary hover:bg-primary/90 shadow-lg transition-all hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Nova Consulta
          </Button>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          const badge =
            item.badgeKey === 'requests' && pendingRequests > 0
              ? pendingRequests
              : item.path === '/admin/agenda' && pendingToday > 0
                ? pendingToday
                : null;

          if (isCollapsed) {
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center justify-center h-10 w-full rounded-xl transition-all relative',
                      isActive
                        ? 'bg-accent text-primary'
                        : 'text-sidebar-foreground hover:bg-accent/50 hover:text-primary'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {badge && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                        {badge}
                      </span>
                    )}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 h-11 px-3 rounded-xl transition-all',
                isActive
                  ? 'bg-accent text-primary font-medium border-l-4 border-primary'
                  : 'text-sidebar-foreground hover:bg-accent/50 hover:text-primary'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge && (
                <span className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Separador */}
      <div className="px-3">
        <div className="border-t border-sidebar-border" />
      </div>

      {/* Configurações e Footer */}
      <div className="p-3 space-y-1">
        {isCollapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/admin/configuracoes"
                  className={cn(
                    'flex items-center justify-center h-10 w-full rounded-xl transition-all',
                    location.pathname === '/admin/configuracoes'
                      ? 'bg-accent text-primary'
                      : 'text-sidebar-foreground hover:bg-accent/50 hover:text-primary'
                  )}
                >
                  <Settings className="h-5 w-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">Configurações</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <NavLink
              to="/admin/configuracoes"
              className={cn(
                'flex items-center gap-3 h-11 px-3 rounded-xl transition-all',
                location.pathname === '/admin/configuracoes'
                  ? 'bg-accent text-primary font-medium border-l-4 border-primary'
                  : 'text-sidebar-foreground hover:bg-accent/50 hover:text-primary'
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </NavLink>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </>
        )}
      </div>

      {/* Toggle - only on desktop */}
      {!isMobile && (
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full text-muted-foreground hover:text-foreground',
              isCollapsed ? 'justify-center' : 'justify-start gap-3'
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
          </Button>
        </div>
      )}
    </aside>
  );
}
