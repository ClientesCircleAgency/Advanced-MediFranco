import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, FileText, User } from 'lucide-react';

const navItems = [
  { to: '/area-cliente', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/area-cliente/agenda', icon: Calendar, label: 'Agenda', end: false },
  { to: '/area-cliente/historico', icon: Clock, label: 'Histórico', end: false },
  { to: '/area-cliente/documentos', icon: FileText, label: 'Docs', end: false },
  { to: '/area-cliente/perfil', icon: User, label: 'Perfil', end: false },
];

export function PatientBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition-colors ${
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
