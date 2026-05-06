import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useClinic } from '@/context/ClinicContext';
import type { ClinicAppointment } from '@/types/clinic';

interface WeekViewProps {
  currentDate: Date;
  selectedProfessional: string;
  selectedStatus: string;
  searchQuery: string;
  onAppointmentClick: (appointment: ClinicAppointment) => void;
}

export function WeekView({
  currentDate,
  selectedProfessional,
  selectedStatus,
  searchQuery,
  onAppointmentClick,
}: WeekViewProps) {
  const { appointments, getPatientById, getProfessionalById } = useClinic();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const getAppointmentsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
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

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      <div className="grid grid-cols-7">
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`px-1 py-3 text-center lg:px-2 ${isSameDay(day, new Date()) ? 'bg-cyan-50' : 'bg-slate-50'}`}
          >
            <p className="text-[10px] font-medium uppercase text-slate-400 lg:text-xs">{format(day, 'EEE', { locale: pt })}</p>
            <p className={`mt-1 text-base font-semibold lg:text-lg ${isSameDay(day, new Date()) ? 'text-cyan-700' : 'text-slate-900'}`}>
              {format(day, 'd')}
            </p>
          </div>
        ))}

        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          return (
            <div
              key={`content-${day.toISOString()}`}
              className="min-h-36 space-y-2 border border-slate-100 p-2 lg:min-h-56 lg:p-3"
            >
              {dayAppointments.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-[1rem] bg-slate-50 text-xs text-slate-400">Sem carga</div>
              ) : (
                dayAppointments.map((appointment) => {
                  const patient = getPatientById(appointment.patientId);
                  const professional = getProfessionalById(appointment.professionalId);
                  return (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => onAppointmentClick(appointment)}
                      className="w-full rounded-[1rem] p-2 text-left text-[11px] transition hover:shadow-sm lg:text-xs"
                      style={{
                        backgroundColor: `${professional?.color}18`,
                        borderLeft: `3px solid ${professional?.color}`,
                      }}
                    >
                      <p className="font-medium text-slate-900">{appointment.time.slice(0, 5)}</p>
                      <p className="mt-1 truncate text-slate-600">{patient?.name}</p>
                    </button>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
