import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { ClinicProvider } from '@/context/ClinicContext';
import { AppointmentWizard } from './AppointmentWizard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onNewAppointment={handleNewAppointment}
          onLogout={handleLogout}
        />

        <div
          className={cn(
            'min-h-screen transition-all duration-300 flex flex-col',
            collapsed ? 'ml-16' : 'ml-64'
          )}
        >
          {/* Top Header */}
          <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{pageInfo.title}</h1>
              {pageInfo.subtitle && (
                <p className="text-sm text-muted-foreground">{pageInfo.subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Bot Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Bot WhatsApp Ativo</span>
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                  2
                </span>
              </Button>
              
              {/* User Avatar */}
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                  DF
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Main Content */}
          <main className={cn(
            'flex-1',
            isMessagesPage ? '' : 'p-6'
          )}>
            <Outlet />
          </main>
        </div>

        <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </div>
    </ClinicProvider>
  );
}
