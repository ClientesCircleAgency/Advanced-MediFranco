import { useMemo } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { useClinic } from '@/context/ClinicContext';
import type { ClinicAppointment } from '@/types/clinic';
import { cn } from '@/lib/utils';

const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

interface DayViewProps {
  appointments: ClinicAppointment[];
  onAppointmentClick: (appointment: ClinicAppointment) => void;
}

const statusConfig: Record<
  string,
  { label: string; shortLabel: string; bgClass: string; textClass: string; showDoubleCheck?: boolean }
> = {
  scheduled: { label: 'Enviado', shortLabel: 'Env.', bgClass: 'bg-slate-50', textClass: 'text-slate-500' },
  pre_confirmed: { label: 'Pré-confirmado', shortLabel: 'Pré', bgClass: 'bg-amber-50', textClass: 'text-amber-700' },
  confirmed: { label: 'Confirmado', shortLabel: 'Conf.', bgClass: 'bg-cyan-50', textClass: 'text-cyan-700', showDoubleCheck: true },
  waiting: { label: 'Em espera', shortLabel: 'Esp.', bgClass: 'bg-yellow-50', textClass: 'text-yellow-700' },
  in_progress: { label: 'Em atendimento', shortLabel: 'At.', bgClass: 'bg-violet-50', textClass: 'text-violet-700' },
  completed: { label: 'Concluída', shortLabel: 'Concl.', bgClass: 'bg-emerald-50', textClass: 'text-emerald-700' },
  cancelled: { label: 'Cancelada', shortLabel: 'Canc.', bgClass: 'bg-rose-50', textClass: 'text-rose-700' },
  no_show: { label: 'Faltou', shortLabel: 'Falt.', bgClass: 'bg-fuchsia-50', textClass: 'text-fuchsia-700' },
};

export function DayView({ appointments, onAppointmentClick }: DayViewProps) {
  const { getPatientById, getProfessionalById, getConsultationTypeById } = useClinic();

  const normalizeTime = (time: string): string => time.slice(0, 5);
  const getAppointmentTimeSlotIndex = (time: string): number => TIME_SLOTS.findIndex((slot) => slot === normalizeTime(time));
  const getAppointmentSlotSpan = (appointment: ClinicAppointment): number => Math.ceil(appointment.duration / 30);

  const slotOccupancy = useMemo(() => {
    const map: Record<string, { appointment: ClinicAppointment; isStart: boolean }> = {};

    for (const appointment of appointments) {
      const startIndex = getAppointmentTimeSlotIndex(appointment.time);
      const span = getAppointmentSlotSpan(appointment);

      for (let index = 0; index < span && startIndex + index < TIME_SLOTS.length; index++) {
        const slot = TIME_SLOTS[startIndex + index];
        map[slot] = { appointment, isStart: index === 0 };
      }
    }

    return map;
  }, [appointments]);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      {TIME_SLOTS.map((slot) => {
        const occupancy = slotOccupancy[slot];
        if (occupancy && !occupancy.isStart) return null;

        const appointment = occupancy?.appointment;
        const patient = appointment ? getPatientById(appointment.patientId) : null;
        const professional = appointment ? getProfessionalById(appointment.professionalId) : null;
        const type = appointment ? getConsultationTypeById(appointment.consultationTypeId) : null;
        const slotSpan = appointment ? getAppointmentSlotSpan(appointment) : 1;
        const status = appointment ? statusConfig[appointment.status] || statusConfig.scheduled : null;
        const rowHeight = slotSpan > 1 ? `${slotSpan * 56}px` : undefined;

        return (
          <div
            key={slot}
            className="flex items-stretch border-b border-slate-100 last:border-b-0"
            style={rowHeight ? { minHeight: rowHeight } : { minHeight: '56px' }}
          >
            <div className="w-14 shrink-0 px-2 py-3 text-right text-[11px] font-medium text-slate-400 lg:w-20 lg:px-4 lg:text-sm">
              {slot}
            </div>

            <div className="flex-1 py-1 pr-2 lg:py-1.5 lg:pr-4">
              {appointment && status ? (
                <button
                  type="button"
                  onClick={() => onAppointmentClick(appointment)}
                  className={cn(
                    'flex h-full w-full items-center justify-between rounded-[1.25rem] border px-3 py-2 text-left transition hover:shadow-md lg:px-4',
                    status.bgClass
                  )}
                  style={{
                    borderColor: `${professional?.color || 'hsl(var(--primary))'}40`,
                    borderLeftWidth: '4px',
                    borderLeftColor: professional?.color || 'hsl(var(--primary))',
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">{patient?.name || 'Paciente'}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      <span className="lg:hidden">{type?.name?.split(' ')[0]}</span>
                      <span className="hidden lg:inline">{type?.name} • {professional?.name}</span>
                    </p>
                  </div>

                  <div className="ml-2 flex shrink-0 items-center gap-1">
                    <span className={cn('text-[10px] font-medium lg:text-xs', status.textClass)}>
                      <span className="lg:hidden">{status.shortLabel}</span>
                      <span className="hidden lg:inline">{status.label}</span>
                    </span>
                    {status.showDoubleCheck ? (
                      <CheckCheck className="h-4 w-4 text-cyan-700" />
                    ) : appointment.status === 'scheduled' ? (
                      <Check className="h-4 w-4 text-slate-400" />
                    ) : null}
                  </div>
                </button>
              ) : (
                <div className="h-full rounded-[1.25rem]" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
