import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Clock, Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PatientUser } from '@/types/patient';

export default function DashboardPage() {
  const { patientUser } = useOutletContext<{ patientUser: PatientUser }>();

  const firstName = patientUser.full_name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {greeting}, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">Bem-vindo à sua área de cliente.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Próximas consultas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">0</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm text-muted-foreground">Consultas realizadas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">0</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm text-muted-foreground">Documentos</span>
          </div>
          <p className="text-2xl font-bold text-foreground">0</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Acções rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/consultas-online">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
              <Plus className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">Marcar consulta online</p>
                <p className="text-xs text-muted-foreground">Brevemente disponível</p>
              </div>
            </Button>
          </Link>
          <Link to="/area-cliente/documentos">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
              <FileText className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">Ver documentos</p>
                <p className="text-xs text-muted-foreground">Receitas, relatórios e exames</p>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">Notificações</h2>
        </div>
        <p className="text-sm text-muted-foreground">Sem notificações novas.</p>
      </div>
    </div>
  );
}
