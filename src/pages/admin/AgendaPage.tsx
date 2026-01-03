import { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
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
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { ClinicAppointment } from '@/types/clinic';
import { cn } from '@/lib/utils';

type ViewMode = 'day' | 'week' | 'month';

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

  // Filter appointments by date and professional
  const dayAppointments = useMemo(() => {
    return appointments
      .filter((apt) => {
        if (apt.date !== dateStr) return false;
        if (selectedProfessional !== 'all' && apt.professionalId !== selectedProfessional) return false;
        return true;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, dateStr, selectedProfessional]);

  // Get professionals to show in selector
  const activeProfessionals = useMemo(() => {
    return professionals.filter(p => p.name && p.name.trim() !== '');
  }, [professionals]);

  const handleAppointmentClick = (apt: ClinicAppointment) => {
    setSelectedAppointment(apt);
    setDrawerOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  // Navigation handlers
  const goToToday = () => setCurrentDate(new Date());
  
  const goPrevious = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(prev => subDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  };

  const goNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  };

  // Format the title based on view mode
  const getTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, "EEEE, d 'de' MMMM", { locale: pt });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'd', { locale: pt })} - ${format(weekEnd, "d 'de' MMMM", { locale: pt })}`;
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: pt });
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground capitalize">
            {viewMode === 'day' ? 'Agenda do Dia' : viewMode === 'week' ? 'Agenda Semanal' : 'Agenda Mensal'}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{getTitle()}</p>
        </div>
        
        <Button onClick={() => setWizardOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left side: Navigation + View Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Date Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goPrevious} className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[140px] gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {format(currentDate, 'd MMM yyyy', { locale: pt })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
            
            <Button variant="outline" size="icon" onClick={goNext} className="h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={goToToday} className="ml-1">
              Hoje
            </Button>
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="day" className="px-4">Dia</TabsTrigger>
              <TabsTrigger value="week" className="px-4">Semana</TabsTrigger>
              <TabsTrigger value="month" className="px-4">Mês</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Right side: Filters */}
        <div className="flex items-center gap-3">
          {/* Professional filter */}
          <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os médicos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os médicos</SelectItem>
              {activeProfessionals.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: prof.color }}
                    />
                    {prof.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'day' && (
        <DayView 
          appointments={dayAppointments} 
          onAppointmentClick={handleAppointmentClick} 
        />
      )}

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

      <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} preselectedDate={currentDate} />
      <AppointmentDetailDrawer appointment={selectedAppointment} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
