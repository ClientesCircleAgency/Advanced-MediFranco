import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock } from 'lucide-react';
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-card border border-border rounded-xl p-4 transition-all cursor-grab active:cursor-grabbing',
        isDragging ? 'shadow-xl ring-2 ring-primary/50 scale-105' : 'hover:shadow-md hover:border-primary/30'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div 
          className="w-1 h-12 rounded-full shrink-0"
          style={{ backgroundColor: professional?.color || '#94a3b8' }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {patient?.name || 'Paciente desconhecido'}
          </p>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{appointment.time}</span>
            <span>•</span>
            <span className="truncate">{consultationType?.name || 'Consulta'}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {professional?.name || 'Profissional'}
          </p>
        </div>
      </div>
    </div>
  );
}
