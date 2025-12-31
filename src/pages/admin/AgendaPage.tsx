import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useClinic } from '@/context/ClinicContext';
import { CalendarToolbar, type CalendarView } from '@/components/admin/CalendarToolbar';
import { DaySummaryPanel } from '@/components/admin/DaySummaryPanel';
import { AppointmentWizard } from '@/components/admin/AppointmentWizard';
import { AppointmentDetailDrawer } from '@/components/admin/AppointmentDetailDrawer';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { ClinicAppointment } from '@/types/clinic';

export default function AgendaPage() {
  const { appointments, getPatientById, getProfessionalById, getConsultationTypeById } = useClinic();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ClinicAppointment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  // Filtrar consultas
  const filteredAppointments = appointments.filter((apt) => {
    if (apt.date !== dateStr) return false;
    if (selectedProfessional !== 'all' && apt.professionalId !== selectedProfessional) return false;
    if (selectedStatus !== 'all' && apt.status !== selectedStatus) return false;
    if (searchQuery) {
      const patient = getPatientById(apt.patientId);
      const searchLower = searchQuery.toLowerCase();
      if (!patient?.name.toLowerCase().includes(searchLower) && 
          !patient?.phone.includes(searchQuery) &&
          !patient?.nif.includes(searchQuery)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => a.time.localeCompare(b.time));

  const handleAppointmentClick = (apt: ClinicAppointment) => {
    setSelectedAppointment(apt);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <CalendarToolbar
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            view={view}
            onViewChange={setView}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedProfessional={selectedProfessional}
            onProfessionalChange={setSelectedProfessional}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </div>
        <Button onClick={() => setWizardOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Layout principal */}
      <div className="grid lg:grid-cols-4 gap-4">
        {/* Painel lateral */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <DaySummaryPanel currentDate={currentDate} onAppointmentClick={handleAppointmentClick} />
        </div>

        {/* Calendário/Lista */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <Card>
            <CardContent className="p-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">Sem consultas</p>
                  <p className="text-sm">Não há consultas para os filtros selecionados</p>
                  <Button variant="outline" onClick={() => setWizardOpen(true)} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Agendar Consulta
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAppointments.map((apt) => {
                    const patient = getPatientById(apt.patientId);
                    const professional = getProfessionalById(apt.professionalId);
                    const type = getConsultationTypeById(apt.consultationTypeId);
                    return (
                      <div
                        key={apt.id}
                        onClick={() => handleAppointmentClick(apt)}
                        className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <div
                          className="w-1 h-12 rounded-full shrink-0"
                          style={{ backgroundColor: professional?.color }}
                        />
                        <div className="text-lg font-mono font-medium w-14 shrink-0">{apt.time}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{patient?.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {type?.name} • {professional?.name}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground shrink-0">{apt.duration} min</div>
                        <StatusBadge status={apt.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Nova Consulta */}
      <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} preselectedDate={currentDate} />

      {/* Drawer Detalhes */}
      <AppointmentDetailDrawer
        appointment={selectedAppointment}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
