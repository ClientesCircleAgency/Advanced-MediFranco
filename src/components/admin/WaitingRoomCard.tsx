import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { AppointmentRow, PatientRow, ProfessionalRow, ConsultationTypeRow } from '@/types/database';

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
  consultationType 
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
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-card border border-border rounded-lg transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-primary/50' : 'hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{patient?.name || 'Paciente desconhecido'}</p>
          <p className="text-xs text-muted-foreground">
            {appointment.time} • {consultationType?.name || 'Consulta'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {professional?.name || 'Profissional'}
          </p>
        </div>
      </div>
    </div>
  );
}
