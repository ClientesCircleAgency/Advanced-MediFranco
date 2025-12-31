import { useState } from 'react';
import { Clock, Users, Calendar, ListChecks, Settings2, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { EditHoursModal } from '@/components/admin/EditHoursModal';
import { EditSettingsModal } from '@/components/admin/EditSettingsModal';
import { ManageProfessionalsModal } from '@/components/admin/ManageProfessionalsModal';
import { ManageConsultationTypesModal } from '@/components/admin/ManageConsultationTypesModal';
import { appointmentStatusLabels } from '@/types/clinic';

export default function SettingsPage() {
  const { professionals, consultationTypes } = useClinic();

  const [hoursModalOpen, setHoursModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [professionalsModalOpen, setProfessionalsModalOpen] = useState(false);
  const [typesModalOpen, setTypesModalOpen] = useState(false);

  const [workingHours, setWorkingHours] = useState([
    { day: 'Segunda', start: '09:00', end: '19:00', enabled: true },
    { day: 'Terça', start: '09:00', end: '19:00', enabled: true },
    { day: 'Quarta', start: '09:00', end: '19:00', enabled: true },
    { day: 'Quinta', start: '09:00', end: '19:00', enabled: true },
    { day: 'Sexta', start: '09:00', end: '18:00', enabled: true },
    { day: 'Sábado', start: '09:00', end: '13:00', enabled: true },
    { day: 'Domingo', start: '', end: '', enabled: false },
  ]);

  const [generalSettings, setGeneralSettings] = useState({
    defaultDuration: 30,
    bufferTime: 5,
    minAdvanceTime: 2,
  });

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Configurações da Agenda</h2><p className="text-muted-foreground">Gerir horários, tipos de consulta e profissionais</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Horários de Funcionamento</CardTitle><CardDescription>Defina os horários de abertura da clínica</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {workingHours.map((schedule) => (
              <div key={schedule.day} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3"><Switch checked={schedule.enabled} disabled /><span className={schedule.enabled ? 'font-medium' : 'text-muted-foreground'}>{schedule.day}</span></div>
                {schedule.enabled ? <span className="text-sm text-muted-foreground">{schedule.start} - {schedule.end}</span> : <span className="text-sm text-muted-foreground">Fechado</span>}
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" onClick={() => setHoursModalOpen(true)}>Editar Horários</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" />Configurações Gerais</CardTitle><CardDescription>Parâmetros padrão para agendamentos</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><Label>Duração padrão</Label><p className="text-sm text-muted-foreground">Duração inicial para novas consultas</p></div><Badge variant="secondary">{generalSettings.defaultDuration} min</Badge></div>
            <div className="flex items-center justify-between"><div><Label>Buffer entre consultas</Label><p className="text-sm text-muted-foreground">Intervalo mínimo entre marcações</p></div><Badge variant="secondary">{generalSettings.bufferTime} min</Badge></div>
            <div className="flex items-center justify-between"><div><Label>Antecedência mínima</Label><p className="text-sm text-muted-foreground">Tempo mínimo para agendar</p></div><Badge variant="secondary">{generalSettings.minAdvanceTime} horas</Badge></div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setSettingsModalOpen(true)}>Editar Configurações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Profissionais ({professionals.length})</CardTitle><CardDescription>Equipa médica disponível para agendamentos</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {professionals.map((prof) => (
              <div key={prof.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: prof.color }} />
                <div className="flex-1"><p className="font-medium text-sm">{prof.name}</p><p className="text-xs text-muted-foreground">{prof.specialty}</p></div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" onClick={() => setProfessionalsModalOpen(true)}>Gerir Profissionais</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Tipos de Consulta ({consultationTypes.length})</CardTitle><CardDescription>Categorias de consultas disponíveis</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {consultationTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="font-medium text-sm">{type.name}</span><Badge variant="secondary">{type.defaultDuration} min</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" onClick={() => setTypesModalOpen(true)}>Gerir Tipos</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5" />Estados da Consulta</CardTitle><CardDescription>Estados disponíveis (não editáveis)</CardDescription></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{Object.entries(appointmentStatusLabels).map(([key, label]) => <Badge key={key} variant="outline">{label}</Badge>)}</div></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ToggleRight className="h-5 w-5" />Regras de Agendamento</CardTitle><CardDescription>Configurações de validação</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>Não permitir sobreposição</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Sugerir próximo slot livre</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Confirmar cancelamentos</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Enviar lembretes automáticos</Label><Switch /></div>
          </CardContent>
        </Card>
      </div>

      <EditHoursModal open={hoursModalOpen} onOpenChange={setHoursModalOpen} initialHours={workingHours} onSave={setWorkingHours} />
      <EditSettingsModal open={settingsModalOpen} onOpenChange={setSettingsModalOpen} initialSettings={generalSettings} onSave={setGeneralSettings} />
      <ManageProfessionalsModal open={professionalsModalOpen} onOpenChange={setProfessionalsModalOpen} />
      <ManageConsultationTypesModal open={typesModalOpen} onOpenChange={setTypesModalOpen} />
    </div>
  );
}
