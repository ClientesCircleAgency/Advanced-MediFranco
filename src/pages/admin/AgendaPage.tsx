import { useState, useMemo } from 'react';
import { Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinic } from '@/context/ClinicContext';
import { AppointmentWizard } from '@/components/admin/AppointmentWizard';
import { AppointmentDetailDrawer } from '@/components/admin/AppointmentDetailDrawer';
import { format, addDays, isToday, isTomorrow, parse, addMinutes } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { ClinicAppointment } from '@/types/clinic';
import { cn } from '@/lib/utils';

// Generate time slots from 08:00 to 20:00 in 30-minute intervals
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 8; h <= 20; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 20) {
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function AgendaPage() {
  const { appointments, professionals, getPatientById, getProfessionalById, getConsultationTypeById } = useClinic();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ClinicAppointment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Calculate which time slots an appointment occupies
  // Normalize time to HH:mm format (strip seconds if present)
  const normalizeTime = (time: string): string => {
    return time.slice(0, 5);
  };

  const getAppointmentTimeSlotIndex = (time: string): number => {
    const normalized = normalizeTime(time);
    return TIME_SLOTS.findIndex((slot) => slot === normalized);
  };

  // Group appointments by their time slot for display
  const getAppointmentForSlot = (slot: string): ClinicAppointment | null => {
    return dayAppointments.find((apt) => normalizeTime(apt.time) === slot) || null;
  };

  // Check if a slot is occupied by an ongoing appointment (for duration spanning)
  const isSlotOccupied = (slot: string): ClinicAppointment | null => {
    for (const apt of dayAppointments) {
      const aptStart = parse(apt.time, 'HH:mm', new Date());
      const aptEnd = addMinutes(aptStart, apt.duration);
      const slotTime = parse(slot, 'HH:mm', new Date());
      
      if (slotTime >= aptStart && slotTime < aptEnd) {
        return apt;
      }
    }
    return null;
  };

  // Calculate how many slots an appointment spans
  const getAppointmentSlotSpan = (apt: ClinicAppointment): number => {
    return Math.ceil(apt.duration / 30);
  };

  // Build a map of which slots are "taken" and should be skipped
  const slotOccupancy = useMemo(() => {
    const map: Record<string, { appointment: ClinicAppointment; isStart: boolean }> = {};
    
    for (const apt of dayAppointments) {
      const startIdx = getAppointmentTimeSlotIndex(apt.time);
      const span = getAppointmentSlotSpan(apt);
      
      for (let i = 0; i < span && startIdx + i < TIME_SLOTS.length; i++) {
        const slot = TIME_SLOTS[startIdx + i];
        map[slot] = { appointment: apt, isStart: i === 0 };
      }
    }
    
    return map;
  }, [dayAppointments]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Agenda do Dia</h1>
          <p className="text-sm text-muted-foreground">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: pt })}
          </p>
        </div>
        
        <Button onClick={() => setWizardOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Date tabs */}
        <div className="flex items-center gap-2">
          <Button
            variant={isToday(currentDate) ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="rounded-full px-6"
          >
            Hoje
          </Button>
          <Button
            variant={isTomorrow(currentDate) ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentDate(addDays(new Date(), 1))}
            className="rounded-full px-6"
          >
            Amanhã
          </Button>
        </div>

        <div className="flex items-center gap-4">
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

          {/* Legend */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-primary">
            <Check className="h-4 w-4" />
            <Check className="h-4 w-4 -ml-3" />
            <span>Confirmado WhatsApp</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {TIME_SLOTS.map((slot) => {
          const occupancy = slotOccupancy[slot];
          
          // If this slot is occupied but not the start, skip rendering
          if (occupancy && !occupancy.isStart) {
            return null;
          }
          
          const apt = occupancy?.appointment;
          const patient = apt ? getPatientById(apt.patientId) : null;
          const professional = apt ? getProfessionalById(apt.professionalId) : null;
          const type = apt ? getConsultationTypeById(apt.consultationTypeId) : null;
          const slotSpan = apt ? getAppointmentSlotSpan(apt) : 1;
          
          // Status display config
          const statusConfig: Record<string, { label: string; bg: string; text: string; icon?: 'confirmed' | 'waiting' | 'progress' | 'done' }> = {
            scheduled: { label: 'Agendado', bg: 'bg-muted/30', text: 'text-muted-foreground' },
            pre_confirmed: { label: 'Pré-confirmado', bg: 'bg-yellow-50', text: 'text-yellow-600' },
            confirmed: { label: 'Confirmado', bg: 'bg-primary/5', text: 'text-primary', icon: 'confirmed' },
            waiting: { label: 'Em espera', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'waiting' },
            in_progress: { label: 'Em atendimento', bg: 'bg-orange-100', text: 'text-orange-700', icon: 'progress' },
            completed: { label: 'Concluída', bg: 'bg-muted', text: 'text-muted-foreground', icon: 'done' },
            cancelled: { label: 'Cancelada', bg: 'bg-destructive/10', text: 'text-destructive' },
            no_show: { label: 'Faltou', bg: 'bg-destructive/10', text: 'text-destructive' },
          };
          const status = apt ? statusConfig[apt.status] || statusConfig.scheduled : null;
          
          // Calculate row height based on span
          const rowHeight = slotSpan > 1 ? `${slotSpan * 64}px` : undefined;
          
          return (
            <div
              key={slot}
              className="flex items-stretch border-b border-border last:border-b-0"
              style={rowHeight ? { minHeight: rowHeight } : { minHeight: '64px' }}
            >
              {/* Time column */}
              <div className="w-16 lg:w-20 shrink-0 flex items-start justify-end pr-4 py-4 text-muted-foreground text-sm">
                {slot}
              </div>

              {/* Appointment area */}
              <div className="flex-1 py-2 pr-4">
                {apt && status ? (
                  <div
                    onClick={() => handleAppointmentClick(apt)}
                    className={cn(
                      'h-full flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all hover:shadow-md border-l-4',
                      status.bg
                    )}
                    style={{
                      borderLeftColor: professional?.color || '#3b82f6',
                    }}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{patient?.name || 'Paciente'}</p>
                      <p className="text-sm text-muted-foreground">
                        {type?.name} • {professional?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm', status.text)}>
                        {status.label}
                      </span>
                      {status.icon === 'confirmed' && (
                        <div className="flex">
                          <Check className="h-4 w-4 text-primary" />
                          <Check className="h-4 w-4 text-primary -ml-2" />
                        </div>
                      )}
                      {status.icon === 'waiting' && (
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                      )}
                      {status.icon === 'progress' && (
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      )}
                      {status.icon === 'done' && (
                        <Check className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} preselectedDate={currentDate} />
      <AppointmentDetailDrawer appointment={selectedAppointment} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
