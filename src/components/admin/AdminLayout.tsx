import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from '@/assets/logo-medifranco-v4.png';

const pageTitles: Record<string, { title: string }> = {
  '/admin/dashboard': { title: 'Dashboard' },
  '/admin/agenda': { title: 'Agenda do Dia' },
  '/admin/pacientes': { title: 'Gestão de Pacientes' },
  '/admin/mensagens': { title: 'Mensagens' },
  '/admin/sala-espera': { title: 'Fluxo de Atendimento' },
  '/admin/lista-espera': { title: 'Lista de Espera' },
  '/admin/configuracoes': { title: 'Configurações' },
  '/admin/pedidos': { title: 'Pedidos de Marcação' },
  '/admin/plano': { title: 'Plano' },
  '/admin/blog': { title: 'Gestão do Blog' },
  '/admin/estatisticas': { title: 'Estatísticas de Marcações' },
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Sessão terminada',
      description: 'Até breve!',
    });
    navigate('/admin/login', { replace: true });
  };

  const handleNewAppointment = () => {
    setWizardOpen(true);
    setMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentPath = location.pathname;
  const isMessagesPage = currentPath === '/admin/mensagens';

  return (
    <ClinicProvider>
      <div className="min-h-screen bg-background pt-16">
        {/* Top Header - Modern Glassmorphism */}
        <header className="fixed top-0 left-0 right-0 h-16 px-4 lg:px-8 flex items-center justify-between z-50 transition-all duration-300 bg-background/70 backdrop-blur-xl border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-background/60">

          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-primary/5 rounded-full"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 text-foreground/80" />
            </Button>
          </div>

          {/* Centered Logo - Interactive */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => navigate('/admin/dashboard')}>
            <img
              src={logo}
              alt="MediFranco"
              className="h-8 lg:h-10 w-auto object-contain transition-all duration-300 drop-shadow-sm group-hover:drop-shadow-md"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications - Minimalist & Interactive */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-primary/5 transition-colors duration-300">
                  <Bell className="h-5 w-5 text-foreground/70 transition-colors group-hover:text-foreground" />
                  {notifications && notifications.length > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl border border-border/50 shadow-xl bg-card/95 backdrop-blur-sm">
                <div className="p-4 border-b border-border/50">
                  <h4 className="font-semibold text-sm">Notificações</h4>
                </div>
                <div className="max-h-[400px] overflow-y-auto py-2">
                  {isLoadingNotifications ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">A carregar...</div>
                  ) : notifications?.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Sem novas notificações</div>
                  ) : (
                    notifications?.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="cursor-pointer px-4 py-3 hover:bg-accent/50 focus:bg-accent/50 transition-colors"
                        onClick={() => navigate(notification.link)}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm text-foreground/90">{notification.title}</span>
                          <span className="text-xs text-muted-foreground">{notification.description}</span>
                          <span className="text-[10px] text-muted-foreground/60">{new Date(notification.time).toLocaleString()}</span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            onNewAppointment={handleNewAppointment}
            onLogout={handleLogout}
          />
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border" style={{ marginTop: '0' }}>
            <AdminSidebar
              collapsed={false}
              onToggle={() => { }}
              onNewAppointment={handleNewAppointment}
              onLogout={handleLogout}
              isMobile
            />
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            'min-h-[calc(100vh-4rem)] transition-all duration-300 flex flex-col',
            'lg:ml-64',
            collapsed && 'lg:ml-16'
          )}
        >
          {/* Main Content */}
          <main className={cn(
            'flex-1 overflow-auto',
            isMessagesPage ? '' : 'p-6 lg:p-8'
          )}>
            <div className="fade-in-5 slide-in-from-bottom-2 duration-500 animate-in">
              <Outlet />
            </div>
          </main>
        </div>

        <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </div>
    </ClinicProvider>
  );
}