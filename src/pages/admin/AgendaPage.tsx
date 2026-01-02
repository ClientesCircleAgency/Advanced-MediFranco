import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { AppointmentWizard } from '@/components/admin/AppointmentWizard';
import { AppointmentDetailDrawer } from '@/components/admin/AppointmentDetailDrawer';
import { format, addDays, subDays, isToday, isTomorrow } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { ClinicAppointment } from '@/types/clinic';
import { cn } from '@/lib/utils';

export default function AgendaPage() {
  const { appointments, getPatientById, getProfessionalById, getConsultationTypeById } = useClinic();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ClinicAppointment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  // Filtrar consultas do dia
  const dayAppointments = appointments
    .filter((apt) => apt.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleAppointmentClick = (apt: ClinicAppointment) => {
    setSelectedAppointment(apt);
    setDrawerOpen(true);
  };

  // Agrupar por hora
  const timeSlots = dayAppointments.reduce((acc, apt) => {
    const hour = apt.time.split(':')[0] + ':' + apt.time.split(':')[1];
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(apt);
    return acc;
  }, {} as Record<string, ClinicAppointment[]>);

  return (
    <div className="space-y-6">
      {/* Header com tabs Hoje/Amanhã */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isToday(currentDate) ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className={cn(
              'rounded-full px-6',
              isToday(currentDate) && 'bg-card text-foreground border border-border shadow-sm hover:bg-card'
            )}
          >
            Hoje
          </Button>
          <Button
            variant={isTomorrow(currentDate) ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentDate(addDays(new Date(), 1))}
            className={cn(
              'rounded-full px-6',
              isTomorrow(currentDate) && 'bg-card text-foreground border border-border shadow-sm hover:bg-card'
            )}
          >
            Amanhã
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-primary">
          <Check className="h-4 w-4" />
          <span>Confirmado WhatsApp</span>
        </div>
      </div>

      {/* Lista de Consultas */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {Object.keys(timeSlots).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Sem consultas agendadas para este dia</p>
            <Button className="mt-4" onClick={() => setWizardOpen(true)}>
              Agendar Consulta
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {Object.entries(timeSlots)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([time, apts]) =>
                apts.map((apt) => {
                  const patient = getPatientById(apt.patientId);
                  const professional = getProfessionalById(apt.professionalId);
                  const type = getConsultationTypeById(apt.consultationTypeId);
                  const isConfirmed = apt.status === 'confirmed';

                  return (
                    <div
                      key={apt.id}
                      onClick={() => handleAppointmentClick(apt)}
                      className="flex items-center gap-6 px-6 py-4 hover:bg-accent/30 transition-colors cursor-pointer"
                    >
                      {/* Hora */}
                      <div className="w-16 text-muted-foreground text-sm shrink-0">
                        {apt.time}
                      </div>

                      {/* Card da consulta */}
                      <div
                        className={cn(
                          'flex-1 flex items-center justify-between p-4 rounded-xl border-l-4',
                          isConfirmed
                            ? 'bg-primary/5 border-l-primary'
                            : 'bg-muted/30 border-l-orange-400'
                        )}
                      >
                        <div>
                          <p className="font-semibold text-foreground">{patient?.name || 'Paciente'}</p>
                          <p className="text-sm text-muted-foreground">
                            {type?.name} • {professional?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-sm',
                              isConfirmed ? 'text-primary' : 'text-muted-foreground'
                            )}
                          >
                            {isConfirmed ? 'Confirmado' : 'Enviado'}
                          </span>
                          {isConfirmed ? (
                            <div className="flex">
                              <Check className="h-4 w-4 text-primary" />
                              <Check className="h-4 w-4 text-primary -ml-2" />
                            </div>
                          ) : (
                            <Check className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
          </div>
        )}
      </div>

      <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} preselectedDate={currentDate} />
      <AppointmentDetailDrawer appointment={selectedAppointment} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
