import { useState } from 'react';
import { Users, Clock, Stethoscope, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { format } from 'date-fns';

export default function WaitingRoomPage() {
  const { appointments, getPatientById, getProfessionalById, getConsultationTypeById, updateAppointmentStatus } = useClinic();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter((a) => a.date === today);

  // Agrupar por estado para o kanban
  const columns = [
    {
      id: 'confirmed',
      title: 'Confirmadas',
      icon: Users,
      color: 'text-green-600',
      appointments: todayAppointments.filter((a) => a.status === 'confirmed'),
    },
    {
      id: 'waiting',
      title: 'Em Espera',
      icon: Clock,
      color: 'text-yellow-600',
      appointments: todayAppointments.filter((a) => a.status === 'waiting'),
    },
    {
      id: 'in_progress',
      title: 'Em Atendimento',
      icon: Stethoscope,
      color: 'text-orange-600',
      appointments: todayAppointments.filter((a) => a.status === 'in_progress'),
    },
    {
      id: 'completed',
      title: 'Concluídas',
      icon: CheckCircle,
      color: 'text-muted-foreground',
      appointments: todayAppointments.filter((a) => a.status === 'completed'),
    },
  ];

  const handleAction = (appointmentId: string, newStatus: 'waiting' | 'in_progress' | 'completed') => {
    updateAppointmentStatus(appointmentId, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Sala de Espera</h2>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM")} — {todayAppointments.length} consultas hoje
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <Card key={column.id} className="min-h-[400px]">
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-medium flex items-center gap-2 ${column.color}`}>
                  <Icon className="h-4 w-4" />
                  {column.title}
                  <Badge variant="secondary" className="ml-auto">
                    {column.appointments.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {column.appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Sem pacientes
                  </div>
                ) : (
                  column.appointments
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((apt) => {
                      const patient = getPatientById(apt.patientId);
                      const professional = getProfessionalById(apt.professionalId);
                      const type = getConsultationTypeById(apt.consultationTypeId);

                      return (
                        <div
                          key={apt.id}
                          className="p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">{patient?.name}</p>
                              <p className="text-xs text-muted-foreground">{apt.time} • {type?.name}</p>
                              <p className="text-xs text-muted-foreground">{professional?.name}</p>
                            </div>
                          </div>

                          {/* Ações por coluna */}
                          <div className="mt-2 flex gap-1">
                            {column.id === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 w-full"
                                onClick={() => handleAction(apt.id, 'waiting')}
                              >
                                Check-in
                              </Button>
                            )}
                            {column.id === 'waiting' && (
                              <Button
                                size="sm"
                                className="text-xs h-7 w-full"
                                onClick={() => handleAction(apt.id, 'in_progress')}
                              >
                                Iniciar
                              </Button>
                            )}
                            {column.id === 'in_progress' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="text-xs h-7 w-full"
                                onClick={() => handleAction(apt.id, 'completed')}
                              >
                                Concluir
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
