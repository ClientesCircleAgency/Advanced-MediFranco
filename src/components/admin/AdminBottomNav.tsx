import { NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  MessageSquareMore,
  Newspaper,
  BookOpenCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin/mensagens', label: 'Mensagens', icon: MessageSquareMore },
  { path: '/admin/casos-estudo', label: 'Casos', icon: BookOpenCheck },
  { path: '/admin/blog', label: 'Site e Blog', icon: Newspaper },
];

interface AdminBottomNavProps {
  onNewAppointment: () => void;
  onOpenMenu: () => void;
}

export function AdminBottomNav({ onNewAppointment, onOpenMenu }: AdminBottomNavProps) {
  const location = useLocation();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-2xl shadow-slate-950/15 backdrop-blur-xl lg:hidden">
      <nav className="mx-auto grid max-w-sm grid-cols-3 items-end gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

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
