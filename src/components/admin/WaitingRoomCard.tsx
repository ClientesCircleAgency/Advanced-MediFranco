import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, User } from 'lucide-react';
import type { AppointmentRow, PatientRow, ProfessionalRow, ConsultationTypeRow } from '@/types/database';
import { cn } from '@/lib/utils';

interface WaitingRoomCardProps {
  appointment: AppointmentRow;
  patient: PatientRow | undefined;
  professional: ProfessionalRow | undefined;
  consultationType: ConsultationTypeRow | undefined;
}

export function WaitingRoomCard({
  appointment,
  patient,
  professional,
  consultationType,
}: WaitingRoomCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: {
      appointment,
      currentStatus: appointment.status,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative cursor-grab rounded-[1.5rem] border border-slate-200 bg-white/95 transition-all duration-200 active:cursor-grabbing',
        isDragging
          ? 'scale-[1.02] opacity-95 shadow-2xl ring-2 ring-cyan-300/50'
          : 'hover:border-cyan-200 hover:shadow-lg'
      )}
    >
      <div
        className="absolute left-4 right-4 top-0 h-px"
        style={{ backgroundColor: professional?.color || '#94a3b8' }}
      />

      <div className="p-4 pt-4">
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className={cn(
              'mt-0.5 rounded-xl p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600',
              isDragging && 'bg-cyan-50 text-cyan-700'
            )}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                <User className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <p className="truncate text-sm font-semibold text-slate-950">
                {patient?.name || 'Paciente desconhecido'}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-2 py-1">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{appointment.time.slice(0, 5)}</span>
              </div>
              <span className="truncate">{consultationType?.name || 'Consulta'}</span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: professional?.color || '#94a3b8' }}
              />
              <p className="truncate text-xs text-slate-500">
                {professional?.name || 'Profissional'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
