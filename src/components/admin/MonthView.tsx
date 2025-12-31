import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { pt } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { useClinic } from '@/context/ClinicContext';
import type { ClinicAppointment } from '@/types/clinic';

interface MonthViewProps {
  currentDate: Date;
  selectedProfessional: string;
  selectedStatus: string;
  searchQuery: string;
  onAppointmentClick: (appointment: ClinicAppointment) => void;
  onDateClick?: (date: Date) => void;
}

export function MonthView({
  currentDate,
  selectedProfessional,
  selectedStatus,
  searchQuery,
  onAppointmentClick,
  onDateClick,
}: MonthViewProps) {
  const { appointments, getPatientById, getProfessionalById } = useClinic();

  // Calcular grid do mês
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Gerar todos os dias do calendário
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Filtrar consultas
  const getAppointmentsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return appointments
      .filter((apt) => {
        if (apt.date !== dateStr) return false;
        if (selectedProfessional !== 'all' && apt.professionalId !== selectedProfessional) return false;
        if (selectedStatus !== 'all' && apt.status !== selectedStatus) return false;
        if (searchQuery) {
          const patient = getPatientById(apt.patientId);
          const searchLower = searchQuery.toLowerCase();
          if (
            !patient?.name.toLowerCase().includes(searchLower) &&
            !patient?.phone.includes(searchQuery) &&
            !patient?.nif.includes(searchQuery)
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <Card>
      <CardContent className="p-2">
        {/* Header dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((d) => (
            <div key={d} className="text-center p-2 text-xs font-medium text-muted-foreground uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const dayAppointments = getAppointmentsForDay(d);
            const isCurrentMonth = isSameMonth(d, currentDate);
            const isToday = isSameDay(d, new Date());
            const maxVisible = 3;

            return (
              <div
                key={d.toISOString()}
                className={`min-h-24 border rounded p-1 cursor-pointer transition-colors ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                } ${isToday ? 'border-primary' : 'border-border'} hover:bg-accent/30`}
                onClick={() => onDateClick?.(d)}
              >
                <p
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center'
                      : isCurrentMonth
                      ? ''
                      : 'text-muted-foreground'
                  }`}
                >
                  {format(d, 'd')}
                </p>

                <div className="space-y-0.5">
                  {dayAppointments.slice(0, maxVisible).map((apt) => {
                    const professional = getProfessionalById(apt.professionalId);
                    const patient = getPatientById(apt.patientId);
                    return (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt);
                        }}
                        className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: `${professional?.color}30`,
                          color: professional?.color,
                        }}
                        title={`${apt.time} - ${patient?.name}`}
                      >
                        {apt.time} {patient?.name?.split(' ')[0]}
                      </div>
                    );
                  })}
                  {dayAppointments.length > maxVisible && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      +{dayAppointments.length - maxVisible} mais
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
