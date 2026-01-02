import { useState } from 'react';
import { Plus, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { CalendarToolbar, type CalendarView } from '@/components/admin/CalendarToolbar';
import { DaySummaryPanel } from '@/components/admin/DaySummaryPanel';
import { AppointmentWizard } from '@/components/admin/AppointmentWizard';
import { AppointmentDetailDrawer } from '@/components/admin/AppointmentDetailDrawer';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { WeekView } from '@/components/admin/WeekView';
import { MonthView } from '@/components/admin/MonthView';
import { format, addDays, subDays, isToday } from 'date-fns';
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

  // Estatísticas do dia
  const dayAppointments = appointments.filter((apt) => apt.date === dateStr);
  const scheduled = dayAppointments.filter((a) => a.status === 'scheduled').length;
  const confirmed = dayAppointments.filter((a) => a.status === 'confirmed').length;
  const waiting = dayAppointments.filter((a) => a.status === 'waiting').length;
  const inProgress = dayAppointments.filter((a) => a.status === 'in_progress').length;

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

  const handleDateClickFromMonth = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  return (
    <div className="space-y-6">
      {/* Header com navegação de data */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className={isToday(currentDate) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
          >
            Hoje
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold min-w-48 text-center">
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: pt })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
              <Button
                key={v}
                variant="ghost"
                size="sm"
                onClick={() => setView(v)}
                className={`rounded-none ${view === v ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout principal */}
      {view === 'day' && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Painel lateral esquerdo */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-semibold text-sm text-muted-foreground mb-4">Resumo do Dia</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{scheduled}</p>
                  <p className="text-xs text-muted-foreground">Marcadas</p>
                </div>
                <div className="bg-primary/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{confirmed}</p>
                  <p className="text-xs text-muted-foreground">Confirmadas</p>
                </div>
                <div className="bg-yellow-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-700">{waiting}</p>
                  <p className="text-xs text-muted-foreground">Em Espera</p>
                </div>
                <div className="bg-orange-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-orange-700">{inProgress}</p>
                  <p className="text-xs text-muted-foreground">Atendimento</p>
                </div>
              </div>
            </div>

            <DaySummaryPanel currentDate={currentDate} onAppointmentClick={handleAppointmentClick} />
          </div>

          {/* Área principal */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Consultas</h3>
                <Button onClick={() => setWizardOpen(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Consulta
                </Button>
              </div>
              <div className="p-4">
                {filteredAppointments.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="Sem consultas"
                    description="Não há consultas agendadas para este dia"
                    actionLabel="Agendar Consulta"
                    onAction={() => setWizardOpen(true)}
                  />
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
                          className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-accent/30 transition-colors cursor-pointer"
                        >
                          <div 
                            className="w-1 h-14 rounded-full shrink-0" 
                            style={{ backgroundColor: professional?.color }} 
                          />
                          <div className="text-xl font-mono font-semibold w-16 shrink-0 text-foreground">
                            {apt.time}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{patient?.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {type?.name} • {professional?.name}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground shrink-0 bg-muted px-2 py-1 rounded">
                            {apt.duration} min
                          </div>
                          <StatusBadge status={apt.status} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          selectedProfessional={selectedProfessional}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          onAppointmentClick={handleAppointmentClick}
        />
      )}

      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          selectedProfessional={selectedProfessional}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          onAppointmentClick={handleAppointmentClick}
          onDateClick={handleDateClickFromMonth}
        />
      )}

      <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} preselectedDate={currentDate} />
      <AppointmentDetailDrawer appointment={selectedAppointment} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
