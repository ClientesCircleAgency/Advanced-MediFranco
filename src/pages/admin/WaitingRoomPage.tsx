import { useState, forwardRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CheckCircle, Clock, Stethoscope, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { WaitingRoomCard } from '@/components/admin/WaitingRoomCard';
import { useAppointments, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useConsultationTypes } from '@/hooks/useConsultationTypes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { AppointmentRow, AppointmentStatus } from '@/types/database';

const columns = [
  {
    id: 'confirmed' as AppointmentStatus,
    title: 'Confirmadas',
    accent: 'text-cyan-700',
    iconTone: 'bg-cyan-50 text-cyan-700',
    borderTone: 'border-slate-200',
    emptyIcon: CheckCircle,
    emptyTitle: 'Sem consultas confirmadas',
    emptyDescription: 'As proximas entradas do dia vao surgir aqui.',
  },
  {
    id: 'waiting' as AppointmentStatus,
    title: 'Em sala de espera',
    accent: 'text-amber-700',
    iconTone: 'bg-amber-50 text-amber-700',
    borderTone: 'border-amber-200',
    emptyIcon: Clock,
    emptyTitle: 'Sala de espera vazia',
    emptyDescription: 'Sem pacientes aguardando neste momento.',
  },
  {
    id: 'in_progress' as AppointmentStatus,
    title: 'Em atendimento',
    accent: 'text-violet-700',
    iconTone: 'bg-violet-50 text-violet-700',
    borderTone: 'border-violet-200',
    emptyIcon: Stethoscope,
    emptyTitle: 'Nenhum atendimento ativo',
    emptyDescription: 'Quando o atendimento comecar, aparece aqui.',
  },
  {
    id: 'completed' as AppointmentStatus,
    title: 'Concluidas',
    accent: 'text-emerald-700',
    iconTone: 'bg-emerald-50 text-emerald-700',
    borderTone: 'border-emerald-200',
    emptyIcon: UserCheck,
    emptyTitle: 'Sem concluidas ainda',
    emptyDescription: 'O historico concluido do dia sera mostrado aqui.',
  },
];

interface DroppableColumnProps {
  column: typeof columns[number];
  children: React.ReactNode;
  count: number;
  isOver: boolean;
}

const DroppableColumnContent = forwardRef<HTMLDivElement, DroppableColumnProps>(
  ({ column, children, count, isOver }, ref) => {
    const EmptyIcon = column.emptyIcon;

    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-[280px] flex-col rounded-[1.75rem] border bg-white/90 p-4 shadow-xl shadow-cyan-950/5 transition-all',
          column.borderTone,
          isOver && 'ring-2 ring-cyan-300/60 ring-offset-2'
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-2xl', column.iconTone)}>
              <EmptyIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">{column.title}</p>
              <p className="text-xs text-slate-400">Estado operacional do dia</p>
            </div>
          </div>
          <Badge className={cn('rounded-full border bg-white px-3 py-1 text-xs font-medium', column.borderTone, column.accent)}>
            {count}
          </Badge>
        </div>

        <div className="flex-1 space-y-3">
          {count === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-full', column.iconTone)}>
                <EmptyIcon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-700">{column.emptyTitle}</p>
              <p className="mt-1 text-sm text-slate-500">{column.emptyDescription}</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    );
  }
);
DroppableColumnContent.displayName = 'DroppableColumnContent';

function DroppableColumn({ column, children, count }: Omit<DroppableColumnProps, 'isOver'>) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <DroppableColumnContent ref={setNodeRef} column={column} count={count} isOver={isOver}>
      {children}
    </DroppableColumnContent>
  );
}

export default function WaitingRoomPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: pt });

  const { data: allAppointments = [], isLoading } = useAppointments();
  const { data: patients = [] } = usePatients();
  const { data: professionals = [] } = useProfessionals();
  const { data: consultationTypes = [] } = useConsultationTypes();
  const updateAppointmentStatus = useUpdateAppointmentStatus();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [completionTarget, setCompletionTarget] = useState<AppointmentRow | null>(null);
  const [finalNotes, setFinalNotes] = useState('');
  const [reviewOptOut, setReviewOptOut] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const todayAppointments = allAppointments.filter(
    (appointment) => appointment.date === today && ['confirmed', 'waiting', 'in_progress', 'completed'].includes(appointment.status)
  );

  const getPatient = (id: string) => patients.find((patient) => patient.id === id);
  const getProfessional = (id: string) => professionals.find((professional) => professional.id === id);
  const getConsultationType = (id: string) => consultationTypes.find((type) => type.id === id);

  const getAppointmentsByStatus = (status: AppointmentStatus) =>
    todayAppointments.filter((appointment) => appointment.status === status).sort((a, b) => a.time.localeCompare(b.time));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const appointment = todayAppointments.find((item) => item.id === active.id);
    if (!appointment) return;

    const newStatus = over.id as AppointmentStatus;
    if (appointment.status === newStatus) return;

    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      scheduled: ['pre_confirmed', 'confirmed'],
      pre_confirmed: ['confirmed', 'cancelled'],
      confirmed: ['waiting', 'cancelled'],
      waiting: ['confirmed', 'in_progress', 'no_show'],
      in_progress: ['waiting', 'completed'],
      completed: ['in_progress'],
      cancelled: [],
      no_show: ['waiting'],
    };

    if (!validTransitions[appointment.status]?.includes(newStatus)) {
      toast.error('Transicao de estado invalida');
      return;
    }

    if (newStatus === 'completed') {
      setCompletionTarget(appointment);
      setFinalNotes('');
      setReviewOptOut(false);
      return;
    }

    updateAppointmentStatus.mutate(
      { id: appointment.id, status: newStatus },
      {
        onSuccess: () => {
          const patient = getPatient(appointment.patient_id);
          toast.success(`${patient?.name || 'Paciente'} movido para ${columns.find((column) => column.id === newStatus)?.title}`);
        },
        onError: () => {
          toast.error('Erro ao atualizar estado');
        },
      }
    );
  };

  const handleCompleteAppointment = () => {
    if (!completionTarget) return;

    updateAppointmentStatus.mutate(
      {
        id: completionTarget.id,
        status: 'completed',
        finalNotes: finalNotes.trim() || undefined,
        reviewOptOut,
      },
      {
        onSuccess: () => {
          const patient = getPatient(completionTarget.patient_id);
          toast.success(`${patient?.name || 'Paciente'} concluido`);
          setCompletionTarget(null);
          setFinalNotes('');
          setReviewOptOut(false);
        },
        onError: () => {
          toast.error('Erro ao concluir consulta');
        },
      }
    );
  };

  const activeAppointment = activeId ? todayAppointments.find((appointment) => appointment.id === activeId) : null;
  const activeProfessionalIds = [...new Set(todayAppointments.map((appointment) => appointment.professional_id))];
  const activeProfessionals = professionals.filter((professional) => activeProfessionalIds.includes(professional.id));

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Flow Control"
        title="Sala de espera"
        subtitle="Fluxo clinico presencial com estados claros, superficies leves e transicoes mais limpas entre espera, atendimento e conclusao."
        actions={
          activeProfessionals.length > 0 ? (
            <div className="flex items-center gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 px-3 py-2">
              {activeProfessionals.slice(0, 3).map((professional) => (
                <Avatar key={professional.id} className="h-8 w-8 border border-white/10">
                  <AvatarFallback
                    className="text-[10px] font-medium text-white"
                    style={{ backgroundColor: professional.color }}
                  >
                    {professional.name
                      .split(' ')
                      .map((name) => name[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {activeProfessionals.length > 3 && (
                <span className="text-xs text-slate-300">+{activeProfessionals.length - 3}</span>
              )}
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-5 shadow-xl shadow-cyan-950/5">
          <p className="text-sm text-slate-500">Consultas no fluxo</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{todayAppointments.length}</p>
          <p className="mt-2 text-sm text-slate-500">Tudo o que esta hoje em operacao presencial.</p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-5 shadow-xl shadow-cyan-950/5">
          <p className="text-sm text-slate-500">A aguardar</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{getAppointmentsByStatus('waiting').length}</p>
          <p className="mt-2 text-sm text-slate-500">Pacientes em sala de espera neste momento.</p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-5 shadow-xl shadow-cyan-950/5">
          <p className="text-sm text-slate-500">Hoje</p>
          <p className="mt-3 font-display text-2xl text-slate-950">{formattedDate}</p>
          <p className="mt-2 text-sm text-slate-500">Contexto do dia para a equipa clinica.</p>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => {
            const columnAppointments = getAppointmentsByStatus(column.id);

            return (
              <DroppableColumn key={column.id} column={column} count={columnAppointments.length}>
                {columnAppointments.map((appointment) => (
                  <WaitingRoomCard
                    key={appointment.id}
                    appointment={appointment}
                    patient={getPatient(appointment.patient_id)}
                    professional={getProfessional(appointment.professional_id)}
                    consultationType={getConsultationType(appointment.consultation_type_id)}
                  />
                ))}
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeAppointment && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl">
              <p className="text-sm font-semibold text-slate-950">
                {getPatient(activeAppointment.patient_id)?.name || 'Paciente'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {activeAppointment.time} • {getConsultationType(activeAppointment.consultation_type_id)?.name}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Dialog open={!!completionTarget} onOpenChange={(open) => !open && setCompletionTarget(null)}>
        <DialogContent className="rounded-[1.75rem] border-slate-200 bg-white p-5 shadow-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-slate-950">Concluir atendimento</DialogTitle>
            <DialogDescription>
              Regista o fecho operacional da consulta antes de mover para concluida.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-950">
                {completionTarget ? getPatient(completionTarget.patient_id)?.name || 'Paciente' : 'Paciente'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {completionTarget?.time.slice(0, 5)} - {completionTarget ? getConsultationType(completionTarget.consultation_type_id)?.name || 'Consulta' : 'Consulta'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="final-notes">Notas finais</Label>
              <Textarea
                id="final-notes"
                value={finalNotes}
                onChange={(event) => setFinalNotes(event.target.value)}
                placeholder="Resumo do atendimento, proximos passos ou follow-up."
                className="min-h-28 rounded-2xl bg-white"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <Checkbox
                checked={reviewOptOut}
                onCheckedChange={(checked) => setReviewOptOut(checked === true)}
                className="mt-0.5 h-5 w-5 rounded-md"
              />
              <span className="text-sm leading-5 text-slate-600">
                Nao enviar pedido de review automatico para este atendimento.
              </span>
            </label>
          </div>

          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => setCompletionTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-2xl bg-primary-gradient text-white hover:opacity-90"
              disabled={updateAppointmentStatus.isPending}
              onClick={handleCompleteAppointment}
            >
              Concluir consulta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
