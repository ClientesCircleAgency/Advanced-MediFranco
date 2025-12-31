import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Clock,
  UserCheck,
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

const navItems = [
  { path: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { path: '/admin/pacientes', label: 'Pacientes', icon: Users },
  { path: '/admin/lista-espera', label: 'Lista de Espera', icon: Clock },
  { path: '/admin/sala-espera', label: 'Sala de Espera', icon: UserCheck },
  { path: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewAppointment: () => void;
  onLogout: () => void;
}

export function AdminSidebar({ collapsed, onToggle, onNewAppointment, onLogout }: AdminSidebarProps) {
  const location = useLocation();
  const { waitlist, appointments } = useClinic();

  // Contadores para badges
  const waitlistCount = waitlist.length;
  const todayDate = new Date().toISOString().split('T')[0];
  const pendingToday = appointments.filter(
    (a) => a.date === todayDate && (a.status === 'scheduled' || a.status === 'confirmed')
  ).length;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border px-4">
        {collapsed ? (
          <span className="text-xl font-bold text-primary">MF</span>
        ) : (
          <span className="text-xl font-bold text-primary">MediFranco</span>
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
                className="w-full"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Nova Consulta</TooltipContent>
          </Tooltip>
        ) : (
          <Button onClick={onNewAppointment} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Nova Consulta
          </Button>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const badge =
            item.path === '/admin/lista-espera' && waitlistCount > 0
              ? waitlistCount
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
                      'flex items-center justify-center h-10 w-full rounded-md transition-colors relative',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
                'flex items-center gap-3 h-10 px-3 rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge && (
                <span className="h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-2">
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="w-full text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="w-full"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expandir</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
            <Button
              variant="ghost"
              onClick={onToggle}
              className="w-full justify-start gap-3 text-muted-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
              Recolher
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
