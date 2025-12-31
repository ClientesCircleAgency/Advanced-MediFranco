import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { ClinicProvider } from '@/context/ClinicContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { toast } = useToast();

  // Redirecionar se não autenticado
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
    // Por agora apenas mostra toast - modal será implementado na Fase 2
    toast({
      title: 'Nova Consulta',
      description: 'Modal de criação será implementado na próxima fase.',
    });
    setAppointmentModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    return null;
  }

  // Título da página baseado na rota
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

        {/* Main content */}
        <main
          className={cn(
            'min-h-screen transition-all duration-300',
            collapsed ? 'ml-16' : 'ml-64'
          )}
        >
          {/* Header */}
          <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-30">
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          </header>

          {/* Page content */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </ClinicProvider>
  );
}
