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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useClinic } from '@/context/ClinicContext';
import logoMedifranco from '@/assets/logo-medifranco.png';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { path: '/admin/pacientes', label: 'Pacientes', icon: Users },
  { path: '/admin/mensagens', label: 'Mensagens', icon: MessageSquare, badge: 3 },
  { path: '/admin/sala-espera', label: 'Sala de Espera', icon: Armchair },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewAppointment: () => void;
  onLogout: () => void;
}

export function AdminSidebar({ collapsed, onToggle, onNewAppointment, onLogout }: AdminSidebarProps) {
  const location = useLocation();
  const { appointments } = useClinic();

  const todayDate = new Date().toISOString().split('T')[0];
  const pendingToday = appointments.filter(
    (a) => a.date === todayDate && (a.status === 'scheduled' || a.status === 'confirmed')
  ).length;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto">
            <span className="text-sm font-bold text-primary-foreground">M</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">M</span>
            </div>
            <span className="text-lg font-bold text-foreground">MediFranco</span>
          </div>
        )}
      </div>

      {/* Botão Nova Consulta */}
      <div className="p-3">
        {collapsed ? (
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
            item.badge ? item.badge
            : item.path === '/admin/agenda' && pendingToday > 0
              ? pendingToday
              : null;

          if (collapsed) {
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
                  ? 'bg-accent text-primary font-medium border-r-4 border-primary'
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
        {collapsed ? (
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
                  ? 'bg-accent text-primary font-medium border-r-4 border-primary'
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

      {/* Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'w-full text-muted-foreground hover:text-foreground',
            collapsed ? 'justify-center' : 'justify-start gap-3'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
