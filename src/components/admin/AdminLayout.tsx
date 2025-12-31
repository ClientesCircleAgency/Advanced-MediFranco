import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { ClinicProvider } from '@/context/ClinicContext';
import { AppointmentWizard } from './AppointmentWizard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/agenda')) return 'Agenda';
    if (path.includes('/pacientes')) return 'Pacientes';
    if (path.includes('/lista-espera')) return 'Lista de Espera';
    if (path.includes('/sala-espera')) return 'Sala de Espera';
    if (path.includes('/configuracoes')) return 'Configurações';
    return 'Admin';
  };

  return (
    <ClinicProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onNewAppointment={handleNewAppointment}
          onLogout={handleLogout}
        />

        <main
          className={cn(
            'min-h-screen transition-all duration-300',
            collapsed ? 'ml-16' : 'ml-64'
          )}
        >
          <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-30">
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>

        <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </div>
    </ClinicProvider>
  );
}
