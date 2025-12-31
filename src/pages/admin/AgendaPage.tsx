import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClinic } from '@/context/ClinicContext';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function AgendaPage() {
  const { appointments, professionals, getPatientById, getProfessionalById } = useClinic();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter((a) => a.date === today);

  // Contadores por estado
  const statusCounts = {
    scheduled: todayAppointments.filter((a) => a.status === 'scheduled').length,
    confirmed: todayAppointments.filter((a) => a.status === 'confirmed').length,
    waiting: todayAppointments.filter((a) => a.status === 'waiting').length,
    in_progress: todayAppointments.filter((a) => a.status === 'in_progress').length,
    completed: todayAppointments.filter((a) => a.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header com data */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: pt })}
          </h2>
          <p className="text-muted-foreground">
            {todayAppointments.length} consultas agendadas para hoje
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Estatísticas do dia */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Marcadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statusCounts.scheduled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em espera</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.waiting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{statusCounts.in_progress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">{statusCounts.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder para o calendário */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
            <div className="text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Visualização do calendário</p>
              <p className="text-sm">Será implementado na Fase 2</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de consultas de hoje */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Sem consultas agendadas para hoje</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((apt) => {
                  const patient = getPatientById(apt.patientId);
                  const professional = getProfessionalById(apt.professionalId);
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="text-lg font-mono font-medium w-16">{apt.time}</div>
                      <div className="flex-1">
                        <p className="font-medium">{patient?.name || 'Paciente desconhecido'}</p>
                        <p className="text-sm text-muted-foreground">{professional?.name}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{apt.duration} min</div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
