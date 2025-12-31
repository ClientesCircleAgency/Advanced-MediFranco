import { useMemo } from 'react';
import { Users, Clock, Stethoscope, CheckCircle } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable, closestCenter } from '@dnd-kit/core';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { WaitingRoomCard } from '@/components/admin/WaitingRoomCard';
import { useAppointments, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useConsultationTypes } from '@/hooks/useConsultationTypes';
import type { AppointmentStatus, AppointmentRow } from '@/types/database';
import { toast } from 'sonner';

// Column definitions
const columns = [
  {
    id: 'confirmed' as AppointmentStatus,
    title: 'Confirmadas',
    icon: Users,
    color: 'text-green-600',
  },
  {
    id: 'waiting' as AppointmentStatus,
    title: 'Em Espera',
    icon: Clock,
    color: 'text-yellow-600',
  },
  {
    id: 'in_progress' as AppointmentStatus,
    title: 'Em Atendimento',
    icon: Stethoscope,
    color: 'text-orange-600',
  },
  {
    id: 'completed' as AppointmentStatus,
    title: 'Concluídas',
    icon: CheckCircle,
    color: 'text-muted-foreground',
  },
];

// Droppable column component
function DroppableColumn({ 
  id, 
  children 
}: { 
  id: string; 
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`space-y-2 min-h-[300px] transition-colors rounded-lg p-2 -m-2 ${
        isOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''
      }`}
    >
      {children}
    </div>
  );
}

export default function WaitingRoomPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Fetch data from Supabase
  const { data: appointments = [], isLoading: loadingAppointments } = useAppointments();
  const { data: patients = [] } = usePatients();
  const { data: professionals = [] } = useProfessionals();
  const { data: consultationTypes = [] } = useConsultationTypes();
  
  const updateStatusMutation = useUpdateAppointmentStatus();

  // Helper functions
  const getPatientById = (id: string) => patients.find((p) => p.id === id);
  const getProfessionalById = (id: string) => professionals.find((p) => p.id === id);
  const getConsultationTypeById = (id: string) => consultationTypes.find((c) => c.id === id);

  // Filter today's appointments
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = useMemo(() => 
    appointments.filter((a) => a.date === today),
    [appointments, today]
  );

  // Group appointments by status
  const appointmentsByStatus = useMemo(() => {
    const grouped: Record<string, AppointmentRow[]> = {};
    columns.forEach((col) => {
      grouped[col.id] = todayAppointments
        .filter((a) => a.status === col.id)
        .sort((a, b) => a.time.localeCompare(b.time));
    });
    return grouped;
  }, [todayAppointments]);

  // Get active appointment for drag overlay
  const activeAppointment = activeId 
    ? todayAppointments.find((a) => a.id === activeId) 
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const appointmentId = active.id as string;
    const newStatus = over.id as AppointmentStatus;
    const currentData = active.data.current as { currentStatus: AppointmentStatus } | undefined;
    const currentStatus = currentData?.currentStatus;

    // Don't do anything if dropped in same column
    if (currentStatus === newStatus) return;

    // Validate transition
    const validTransitions: Record<string, AppointmentStatus[]> = {
      confirmed: ['waiting', 'cancelled'],
      waiting: ['in_progress', 'confirmed'],
      in_progress: ['completed', 'waiting'],
      completed: ['in_progress'],
    };

    if (!validTransitions[currentStatus || '']?.includes(newStatus)) {
      toast.error('Transição inválida');
      return;
    }

    // Update status
    updateStatusMutation.mutate(
      { id: appointmentId, status: newStatus },
      {
        onSuccess: () => {
          const statusLabels: Record<string, string> = {
            waiting: 'Em espera',
            in_progress: 'Em atendimento',
            completed: 'Concluída',
            confirmed: 'Confirmada',
          };
          toast.success(`Estado alterado para: ${statusLabels[newStatus]}`);
        },
        onError: () => {
          toast.error('Erro ao atualizar estado');
        },
      }
    );
  };

  if (loadingAppointments) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Sala de Espera</h2>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM")} — {todayAppointments.length} consultas hoje
        </p>
      </div>

      {/* Kanban Board with DnD */}
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => {
            const Icon = column.icon;
            const columnAppointments = appointmentsByStatus[column.id] || [];

            return (
              <Card key={column.id} className="min-h-[400px]">
                <CardHeader className="pb-3">
                  <CardTitle className={`text-sm font-medium flex items-center gap-2 ${column.color}`}>
                    <Icon className="h-4 w-4" />
                    {column.title}
                    <Badge variant="secondary" className="ml-auto">
                      {columnAppointments.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DroppableColumn id={column.id}>
                    {columnAppointments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Sem pacientes
                      </div>
                    ) : (
                      columnAppointments.map((apt) => (
                        <WaitingRoomCard
                          key={apt.id}
                          appointment={apt}
                          patient={getPatientById(apt.patient_id)}
                          professional={getProfessionalById(apt.professional_id)}
                          consultationType={getConsultationTypeById(apt.consultation_type_id)}
                        />
                      ))
                    )}
                  </DroppableColumn>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeAppointment ? (
            <div className="p-3 bg-card border border-border rounded-lg shadow-xl opacity-90">
              <p className="font-medium text-sm">
                {getPatientById(activeAppointment.patient_id)?.name || 'Paciente'}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeAppointment.time}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
