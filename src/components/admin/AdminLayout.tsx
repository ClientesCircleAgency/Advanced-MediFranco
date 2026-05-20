import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { AdminBottomNav } from './AdminBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import logo from '@/assets/logo-medifranco.png';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin/blog': {
    title: 'Site e Blog',
    subtitle: 'Gestao editorial e superficies publicas do site principal.',
  },
  '/admin/mensagens': {
    title: 'Mensagens',
    subtitle: 'Inbox operacional com follow-up e contexto clinico.',
  },
  '/admin/casos-estudo': {
    title: 'Casos de Estudo',
    subtitle: 'Gestao dos cards clinicos e pop-ups da pagina publica.',
  },
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Sessao terminada',
      description: 'Ate breve.',
    });
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-300" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentPage = pageTitles[location.pathname] ?? {
    title: 'Site e Blog',
    subtitle: 'Gestao editorial e mensagens da MediFranco.',
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_24%),radial-gradient(circle_at_85%_8%,rgba(8,145,178,0.12),transparent_26%),linear-gradient(180deg,#f8ffff_0%,#eef9fb_42%,#f7fbfb_100%)] pb-28 pt-24 text-foreground lg:pb-0 lg:pt-28">
        <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 lg:px-6">
          <div className="mx-auto flex h-20 max-w-[1700px] items-center justify-between rounded-[2rem] border border-white/70 bg-white/90 px-4 shadow-xl shadow-cyan-950/10 backdrop-blur-xl lg:h-24 lg:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu"
                className="rounded-2xl text-slate-600 hover:bg-cyan-50 hover:text-primary lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <button
                type="button"
                onClick={() => navigate('/admin/blog')}
                className="group flex items-center gap-3 rounded-2xl px-1 text-left"
              >
                <div className="flex h-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50/80 px-3">
                  <img
                    src={logo}
                    alt="MediFranco"
                    className="h-8 w-auto max-w-[132px] object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="hidden min-w-0 md:block">
                  <p className="font-display text-base font-semibold text-slate-950">{currentPage.title}</p>
                  <p className="max-w-xl truncate text-xs text-slate-500">{currentPage.subtitle}</p>
                </div>
              </button>
            </div>

            <div className="hidden lg:block" />

            <div className="hidden lg:block" />
          </div>
        </header>

        <div className="hidden lg:block">
          <AdminSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            onNewAppointment={() => {}}
            onLogout={handleLogout}
          />
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-80 border-white/10 bg-slate-950 p-0 text-slate-100">
            <AdminSidebar
              collapsed={false}
              onToggle={() => {}}
              onNewAppointment={() => {}}
              onLogout={handleLogout}
              isMobile
            />
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            'flex min-h-[calc(100vh-6rem)] flex-col transition-all duration-300',
            'lg:ml-72',
            collapsed && 'lg:ml-16'
          )}
        >
          <main className="flex-1 px-3 pb-4 pt-3 sm:px-4 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <Outlet />
            </div>
          </main>
        </div>

        <AdminBottomNav
          onNewAppointment={() => {}}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />
    </div>
  );
}
