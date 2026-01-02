import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { ClinicProvider } from '@/context/ClinicContext';
import { AppointmentWizard } from './AppointmentWizard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/admin/dashboard': { title: 'Dashboard', subtitle: 'Bem-vindo de volta, Dr. Franco.' },
  '/admin/agenda': { title: 'Agenda do Dia', subtitle: 'Bem-vindo de volta, Dr. Franco.' },
  '/admin/pacientes': { title: 'Gestão de Pacientes', subtitle: 'Bem-vindo de volta, Dr. Franco.' },
  '/admin/mensagens': { title: 'Inbox WhatsApp', subtitle: 'Bem-vindo de volta, Dr. Franco.' },
  '/admin/sala-espera': { title: 'Fluxo de Atendimento', subtitle: 'Bem-vindo de volta, Dr. Franco.' },
  '/admin/lista-espera': { title: 'Lista de Espera', subtitle: 'Bem-vindo de volta, Dr. Franco.' },
  '/admin/configuracoes': { title: 'Configurações', subtitle: 'Bem-vindo de volta, Dr. Franco.' },
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { toast } = useToast();

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
  const pageInfo = pageTitles[currentPath] || { title: 'Admin' };
  const isMessagesPage = currentPath === '/admin/mensagens';

  return (
    <ClinicProvider>
      <div className="min-h-screen bg-background">
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
          <SheetContent side="left" className="p-0 w-72">
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
            'min-h-screen transition-all duration-300 flex flex-col',
            'lg:ml-64',
            collapsed && 'lg:ml-16'
          )}
        >
          {/* Top Header */}
          <header className="h-14 lg:h-16 border-b border-border bg-card px-4 lg:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-base lg:text-xl font-semibold text-foreground">{pageInfo.title}</h1>
                <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">{pageInfo.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Bot Status - hidden on small screens */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs lg:text-sm text-muted-foreground whitespace-nowrap">Bot WhatsApp Ativo</span>
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                  2
                </span>
              </Button>
              
              {/* User Avatar */}
              <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs lg:text-sm">
                  DF
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

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
