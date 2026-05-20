import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Newspaper,
  MessageSquareMore,
  BookOpenCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navSections = [
  {
    label: 'Gestao do Site',
    items: [
      { path: '/admin/mensagens', label: 'Mensagens', icon: MessageSquareMore, badgeKey: 'messages' },
      { path: '/admin/casos-estudo', label: 'Casos de Estudo', icon: BookOpenCheck },
      { path: '/admin/blog', label: 'Site e Blog', icon: Newspaper },
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
      {!isCollapsed && (
        <div className="mx-3 mt-3 rounded-[1.75rem] border border-cyan-400/10 bg-white/5 px-4 py-4 shadow-lg shadow-cyan-950/20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">MediFranco</p>
          <p className="mt-2 text-sm text-slate-300">Gestao editorial do site e mensagens recebidas.</p>
        </div>
      )}

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
                  item.badgeKey === 'messages' && unreadMessages > 0
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
