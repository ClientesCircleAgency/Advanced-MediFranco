import { useState } from 'react';
import { Plus, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { waitlistPriorityLabels, timePreferenceLabels } from '@/types/clinic';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function WaitlistPage() {
  const { waitlist, getPatientById, getSpecialtyById, getProfessionalById } = useClinic();

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  // Ordenar por prioridade
  const sortedWaitlist = [...waitlist].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lista de Espera</h2>
          <p className="text-muted-foreground">
            {waitlist.length} paciente{waitlist.length !== 1 ? 's' : ''} em espera
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar à Lista
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Alta Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {waitlist.filter((w) => w.priority === 'high').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Média Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {waitlist.filter((w) => w.priority === 'medium').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Baixa Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {waitlist.filter((w) => w.priority === 'low').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      {sortedWaitlist.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">Lista de espera vazia</p>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione pacientes quando precisar preencher vagas
            </p>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Paciente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedWaitlist.map((item) => {
            const patient = getPatientById(item.patientId);
            const specialty = item.specialtyId ? getSpecialtyById(item.specialtyId) : null;
            const professional = item.professionalId ? getProfessionalById(item.professionalId) : null;

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Prioridade */}
                    <Badge className={getPriorityColor(item.priority)}>
                      {waitlistPriorityLabels[item.priority]}
                    </Badge>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold">{patient?.name || 'Paciente desconhecido'}</h3>
                      <p className="text-sm text-muted-foreground">{patient?.phone}</p>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        {specialty && (
                          <span className="text-muted-foreground">
                            <strong>Especialidade:</strong> {specialty.name}
                          </span>
                        )}
                        {professional && (
                          <span className="text-muted-foreground">
                            <strong>Profissional:</strong> {professional.name}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          <strong>Horário:</strong> {timePreferenceLabels[item.timePreference]}
                        </span>
                      </div>

                      {item.reason && (
                        <p className="mt-2 text-sm bg-muted/50 p-2 rounded">{item.reason}</p>
                      )}

                      <p className="mt-2 text-xs text-muted-foreground">
                        Adicionado em {format(new Date(item.createdAt), "d 'de' MMMM", { locale: pt })}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        Sugerir Encaixe
                      </Button>
                      <Button size="sm" className="gap-1">
                        Converter
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
