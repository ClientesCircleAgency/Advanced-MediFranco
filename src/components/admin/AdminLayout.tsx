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
      <div className="min-h-screen bg-background pt-24 lg:pt-32">
        {/* Top Header - Fixed Full Width */}
        <header className="fixed top-0 left-0 right-0 h-24 lg:h-32 border-b border-border bg-card px-4 lg:px-6 flex items-center justify-between shrink-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img
              src={logo}
              alt="MediFranco"
              className="h-16 lg:h-24 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                  {notifications && notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground font-mono text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoadingNotifications ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">A carregar...</div>
                ) : notifications?.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Sem novas notificações</div>
                ) : (
                  notifications?.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="cursor-pointer py-3 border-b last:border-0"
                      onClick={() => navigate(notification.link)}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm leading-none">{notification.title}</span>
                        <span className="text-xs text-muted-foreground">{notification.description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
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
          <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border" style={{ marginTop: '0' }}> {/* Ensure full height on mobile if needed, or adjust top */}
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
            'min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-8rem)] transition-all duration-300 flex flex-col',
            'lg:ml-64',
            collapsed && 'lg:ml-16'
          )}
        >
          {/* Main Content */}
          <main className={cn(
            'flex-1 overflow-auto',
            isMessagesPage ? '' : 'p-4 lg:p-6'
          )}>
            <Outlet />
          </main>
        </div>

        <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </div>
    </ClinicProvider>
  );
}