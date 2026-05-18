import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { AdminBottomNav } from './AdminBottomNav';
import { ClinicProvider } from '@/context/ClinicContext';
import { AppointmentWizard } from './AppointmentWizard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/logo-medifranco.png';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': {
    title: 'Command Center',
    subtitle: 'Operacao presencial e online numa unica superficie.',
  },
  '/admin/agenda': {
    title: 'Agenda Hibrida',
    subtitle: 'Carga de trabalho do dia, capacidade e follow-up.',
  },
  '/admin/pacientes': {
    title: 'Pacientes',
    subtitle: 'Registo clinico, historico e proximas interacoes.',
  },
  '/admin/sala-espera': {
    title: 'Fluxo Clinico',
    subtitle: 'Estados ativos do atendimento presencial em tempo real.',
  },
  '/admin/lista-espera': {
    title: 'Lista de Espera',
    subtitle: 'Pedidos sensiveis a disponibilidade e encaixes.',
  },
  '/admin/configuracoes': {
    title: 'Configuracoes',
    subtitle: 'Controlos operacionais, branding e regras da clinica.',
  },
  '/admin/pedidos': {
    title: 'Triage e Pedidos',
    subtitle: 'Intake antes da conversao para trabalho agendado.',
  },
  '/admin/plano': {
    title: 'Plano',
    subtitle: 'Entitlements, evolucao da conta e proximos upgrades.',
  },
  '/admin/blog': {
    title: 'Site e Blog',
    subtitle: 'Gestao editorial e superficies publicas do site principal.',
  },
  '/admin/estatisticas': {
    title: 'Analytics',
    subtitle: 'Visibilidade sobre throughput, conversao e ocupacao.',
  },
  '/admin/mensagens': {
    title: 'Mensagens',
    subtitle: 'Inbox operacional com follow-up e contexto clinico.',
  },
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const { data: notifications, isLoading: isLoadingNotifications } = useNotifications();

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
    navigate('/admin/login', { replace: true });
  };

  const handleNewAppointment = () => {
    setWizardOpen(true);
    setMobileMenuOpen(false);
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
    title: 'Operacoes',
    subtitle: 'Centro de gestao do ecossistema MediFranco.',
  };

  return (
    <ClinicProvider>
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
                onClick={() => navigate('/admin/dashboard')}
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

            <div className="hidden items-center gap-2 lg:flex">
              <Button
                onClick={handleNewAppointment}
                className="rounded-2xl bg-primary-gradient px-4 text-white shadow-lg shadow-cyan-950/25 hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova consulta
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Abrir notificacoes"
                    className="relative h-11 w-11 rounded-2xl text-slate-600 hover:bg-cyan-50 hover:text-primary"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications && notifications.length > 0 && (
                      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 rounded-2xl border border-white/10 bg-slate-950/95 p-0 text-slate-100 shadow-xl backdrop-blur-xl"
                >
                  <div className="border-b border-white/10 px-4 py-3">
                    <h4 className="text-sm font-semibold">Notificacoes</h4>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto py-2">
                    {isLoadingNotifications ? (
                      <div className="p-4 text-center text-sm text-slate-400">A carregar...</div>
                    ) : notifications?.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-400">Sem novas notificacoes</div>
                    ) : (
                      notifications?.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="cursor-pointer px-4 py-3 text-slate-100 focus:bg-white/10"
                          onClick={() => navigate(notification.link)}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{notification.title}</span>
                            <span className="text-xs text-slate-400">{notification.description}</span>
                            <span className="text-[10px] text-slate-500">{new Date(notification.time).toLocaleString()}</span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="hidden lg:block">
          <AdminSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            onNewAppointment={handleNewAppointment}
            onLogout={handleLogout}
          />
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-80 border-white/10 bg-slate-950 p-0 text-slate-100">
            <AdminSidebar
              collapsed={false}
              onToggle={() => {}}
              onNewAppointment={handleNewAppointment}
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
          onNewAppointment={handleNewAppointment}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />

        <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </div>
    </ClinicProvider>
  );
}
