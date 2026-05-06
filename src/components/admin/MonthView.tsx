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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getAppointmentsForDay = (currentDay: Date) => {
    const dateStr = format(currentDay, 'yyyy-MM-dd');
    return appointments
      .filter((appointment) => {
        if (appointment.date !== dateStr) return false;
        if (selectedProfessional !== 'all' && appointment.professionalId !== selectedProfessional) return false;
        if (selectedStatus !== 'all' && appointment.status !== selectedStatus) return false;
        if (searchQuery) {
          const patient = getPatientById(appointment.patientId);
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

  const weekDays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {weekDays.map((dayLabel) => (
          <div key={dayLabel} className="py-3 text-center text-[10px] font-medium text-slate-400 lg:text-xs">
            {dayLabel}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((currentDay) => {
          const dayAppointments = getAppointmentsForDay(currentDay);
          const isCurrentMonth = isSameMonth(currentDay, currentDate);
          const isToday = isSameDay(currentDay, new Date());
          const maxVisibleDesktop = 3;

          return (
            <button
              key={currentDay.toISOString()}
              type="button"
              className={`min-h-20 border border-slate-100 p-1 text-left transition hover:bg-slate-50 lg:min-h-28 lg:p-2 ${
                isCurrentMonth ? 'bg-white' : 'bg-slate-50/70'
              }`}
              onClick={() => onDateClick?.(currentDay)}
            >
              <div className="mb-1 flex items-center justify-center lg:justify-start">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium lg:h-7 lg:w-7 lg:text-xs ${
                    isToday ? 'bg-cyan-700 text-white' : isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {format(currentDay, 'd')}
                </span>
              </div>

              <div className="flex justify-center gap-1 lg:hidden">
                {dayAppointments.slice(0, 3).map((appointment) => {
                  const professional = getProfessionalById(appointment.professionalId);
                  return (
                    <div
                      key={appointment.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: professional?.color }}
                    />
                  );
                })}
              </div>

              <div className="hidden space-y-1 lg:block">
                {dayAppointments.slice(0, maxVisibleDesktop).map((appointment) => {
                  const professional = getProfessionalById(appointment.professionalId);
                  const patient = getPatientById(appointment.patientId);
                  return (
                    <div
                      key={appointment.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                      className="truncate rounded-md px-1.5 py-1 text-[10px]"
                      style={{
                        backgroundColor: `${professional?.color}18`,
                        color: professional?.color,
                      }}
                      title={`${appointment.time} - ${patient?.name}`}
                    >
                      {appointment.time.slice(0, 5)} {patient?.name?.split(' ')[0]}
                    </div>
                  );
                })}
                {dayAppointments.length > maxVisibleDesktop && (
                  <p className="text-center text-[10px] text-slate-400">+{dayAppointments.length - maxVisibleDesktop}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
