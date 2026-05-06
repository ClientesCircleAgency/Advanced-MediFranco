import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { PatientSidebar } from './PatientSidebar';
import { PatientBottomNav } from './PatientBottomNav';
import { Loader2 } from 'lucide-react';

export function PatientLayout() {
  const { patientUser, isLoading, isAuthenticated, logout } = usePatientAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/area-cliente/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  async function handleLogout() {
    await logout();
    navigate('/area-cliente/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patientUser) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <PatientSidebar patientUser={patientUser} onLogout={handleLogout} />

      <main className="flex-1 min-h-screen pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-5xl">
          <Outlet context={{ patientUser }} />
        </div>
      </main>

      <PatientBottomNav />
    </div>
  );
}
