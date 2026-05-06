import { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useClinic } from '@/context/ClinicContext';
import { AppointmentWizard } from '@/components/admin/AppointmentWizard';
import { AppointmentDetailDrawer } from '@/components/admin/AppointmentDetailDrawer';
import { DayView } from '@/components/admin/DayView';
import { WeekView } from '@/components/admin/WeekView';
import { MonthView } from '@/components/admin/MonthView';
import { PageHeader } from '@/components/admin/PageHeader';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { ClinicAppointment } from '@/types/clinic';
import { cn } from '@/lib/utils';

type ViewMode = 'day' | 'week' | 'month';

const shellCardClassName =
  'rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-cyan-950/5 backdrop-blur-sm';

export default function AgendaPage() {
  const { appointments, professionals } = useClinic();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ClinicAppointment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        if (appointment.date !== dateStr) return false;
        if (selectedProfessional !== 'all' && appointment.professionalId !== selectedProfessional) return false;
        return true;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, dateStr, selectedProfessional]);

  const activeProfessionals = useMemo(() => {
    return professionals.filter((professional) => professional.name && professional.name.trim() !== '');
  }, [professionals]);

  const handleAppointmentClick = (appointment: ClinicAppointment) => {
    setSelectedAppointment(appointment);
    setDrawerOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const goToToday = () => setCurrentDate(new Date());

  const goPrevious = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate((previous) => subDays(previous, 1));
        break;
      case 'week':
        setCurrentDate((previous) => subWeeks(previous, 1));
        break;
      case 'month':
        setCurrentDate((previous) => subMonths(previous, 1));
        break;
    }
  };

  const goNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate((previous) => addDays(previous, 1));
        break;
      case 'week':
        setCurrentDate((previous) => addWeeks(previous, 1));
        break;
      case 'month':
        setCurrentDate((previous) => addMonths(previous, 1));
        break;
    }
  };

  const getTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, "EEEE, d 'de' MMMM", { locale: pt });
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'd', { locale: pt })} - ${format(weekEnd, "d 'de' MMMM", { locale: pt })}`;
      }
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: pt });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Schedule Layer"
        title="Agenda híbrida"
        subtitle="Planeamento diário com navegação leve, filtros limpos e a mesma linguagem visual do command center."
        actions={
          <Button onClick={() => setWizardOpen(true)} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
            <Plus className="mr-2 h-4 w-4" />
            Nova consulta
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Consultas deste dia</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{dayAppointments.length}</p>
          <p className="mt-2 text-sm text-slate-500">Carga filtrada para a data e profissional selecionados.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Vista ativa</p>
          <p className="mt-3 font-display text-3xl capitalize text-slate-950">{viewMode === 'day' ? 'Dia' : viewMode === 'week' ? 'Semana' : 'Mês'}</p>
          <p className="mt-2 text-sm text-slate-500">Alterna entre detalhe operacional e leitura mais estratégica.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Profissionais ativos</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{activeProfessionals.length}</p>
          <p className="mt-2 text-sm text-slate-500">Recursos disponíveis para a operação clínica.</p>
        </div>
      </div>

      <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-slate-950">Navegação temporal</h2>
            <p className="mt-1 text-sm text-slate-500">Controlos simplificados para gerir o dia, a semana ou o mês sem ruído visual.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={goPrevious} className="h-11 w-11 rounded-2xl border-slate-200">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 min-w-[180px] justify-start gap-2 rounded-2xl border-slate-200 bg-slate-50 text-slate-700">
                  <CalendarDays className="h-4 w-4" />
                  {format(currentDate, 'd MMM yyyy', { locale: pt })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto rounded-2xl border-slate-200 p-0" align="start">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => {
                    if (date) {
                      setCurrentDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={goNext} className="h-11 w-11 rounded-2xl border-slate-200">
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="ghost" onClick={goToToday} className="h-11 rounded-2xl px-4 text-slate-600 hover:bg-slate-100">
              Hoje
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full lg:max-w-sm">
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-1.5">
              <TabsTrigger value="day" className="rounded-[1rem] px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white">
                Dia
              </TabsTrigger>
              <TabsTrigger value="week" className="rounded-[1rem] px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white">
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="rounded-[1rem] px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white">
                Mês
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="flex h-11 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span className="capitalize">{getTitle()}</span>
            </div>
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger className="h-11 min-w-[180px] rounded-2xl border-slate-200 bg-slate-50">
                <SelectValue placeholder="Filtrar profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {activeProfessionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: professional.color }} />
                      <span>{professional.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className={cn(shellCardClassName, 'overflow-hidden p-4 lg:p-5')}>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-950">Superfície operacional</h3>
            <p className="text-sm text-slate-500">A agenda mantém o contexto clínico com um visual mais calmo e coerente.</p>
          </div>
        </div>

        {viewMode === 'day' && <DayView appointments={dayAppointments} onAppointmentClick={handleAppointmentClick} />}
        {viewMode === 'week' && (
          <WeekView
            currentDate={currentDate}
            selectedProfessional={selectedProfessional}
            selectedStatus="all"
            searchQuery=""
            onAppointmentClick={handleAppointmentClick}
          />
        )}
        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            selectedProfessional={selectedProfessional}
            selectedStatus="all"
            searchQuery=""
            onAppointmentClick={handleAppointmentClick}
            onDateClick={handleDateClick}
          />
        )}
      </div>

      <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} preselectedDate={currentDate} />
      <AppointmentDetailDrawer appointment={selectedAppointment} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
