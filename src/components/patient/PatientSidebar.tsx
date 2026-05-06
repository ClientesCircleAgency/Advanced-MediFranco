import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, FileText, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PatientUser } from '@/types/patient';

const navItems = [
  { to: '/area-cliente', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/area-cliente/agenda', icon: Calendar, label: 'Agenda', end: false },
  { to: '/area-cliente/historico', icon: Clock, label: 'Histórico', end: false },
  { to: '/area-cliente/documentos', icon: FileText, label: 'Documentos', end: false },
  { to: '/area-cliente/configuracoes', icon: Settings, label: 'Configurações', end: false },
];

interface PatientSidebarProps {
  patientUser: PatientUser;
  onLogout: () => void;
}

export function PatientSidebar({ patientUser, onLogout }: PatientSidebarProps) {
  const initials = patientUser.full_name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
            {patientUser.avatar_url ? (
              <img src={patientUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{patientUser.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{patientUser.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <NavLink
          to="/area-cliente/perfil"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-1 ${
              isActive
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`
          }
        >
          <User className="w-4 h-4 shrink-0" />
          Perfil
        </NavLink>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
