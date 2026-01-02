import { useState } from 'react';
import { Clock, Users, Calendar, ListChecks, Settings2, ToggleRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { PageHeader } from '@/components/admin/PageHeader';
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
      <PageHeader
        title="Definições da Clínica"
        subtitle="Configure os horários, profissionais e tipos de consulta"
        actions={
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Alterações
          </Button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Coluna esquerda */}
        <div className="lg:col-span-4 space-y-6">
          {/* Horário de Funcionamento */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Horário de Funcionamento</h3>
                  <p className="text-sm text-muted-foreground">Configure os dias e horas de atendimento</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {workingHours.map((schedule) => (
                <div key={schedule.day} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Switch checked={schedule.enabled} disabled className="data-[state=checked]:bg-primary" />
                    <span className={schedule.enabled ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                      {schedule.day}
                    </span>
                  </div>
                  {schedule.enabled ? (
                    <span className="text-sm text-muted-foreground font-mono">
                      {schedule.start} - {schedule.end}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Fechado</span>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => setHoursModalOpen(true)}>
                Editar Horários
              </Button>
            </div>
          </div>

          {/* Regras Automáticas */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <ToggleRight className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Regras Automáticas</h3>
                  <p className="text-sm text-muted-foreground">Configurações de validação</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Não permitir sobreposição</Label>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Sugerir próximo slot livre</Label>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Confirmar cancelamentos</Label>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Enviar lembretes</Label>
                <Switch className="data-[state=checked]:bg-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="lg:col-span-8 space-y-6">
          {/* Equipa Médica */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Equipa Médica</h3>
                  <p className="text-sm text-muted-foreground">{professionals.length} profissionais registados</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setProfessionalsModalOpen(true)}>
                Gerir Profissionais
              </Button>
            </div>
            <div className="p-5">
              <div className="grid md:grid-cols-2 gap-4">
                {professionals.map((prof) => (
                  <div
                    key={prof.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-accent/30 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: prof.color }}
                    >
                      {prof.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{prof.name}</p>
                      <p className="text-sm text-muted-foreground">{prof.specialty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tipos de Consulta */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Tipos de Consulta</h3>
                  <p className="text-sm text-muted-foreground">{consultationTypes.length} tipos disponíveis</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setTypesModalOpen(true)}>
                Gerir Tipos
              </Button>
            </div>
            <div className="p-5">
              <div className="grid md:grid-cols-2 gap-4">
                {consultationTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/30 transition-colors"
                  >
                    <span className="font-medium text-foreground">{type.name}</span>
                    <Badge variant="secondary" className="font-mono">
                      {type.defaultDuration} min
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configurações Gerais e Estados */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Configurações Gerais */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Settings2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Configurações Gerais</h3>
                    <p className="text-sm text-muted-foreground">Parâmetros padrão</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duração padrão</span>
                  <Badge variant="secondary">{generalSettings.defaultDuration} min</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Buffer entre consultas</span>
                  <Badge variant="secondary">{generalSettings.bufferTime} min</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Antecedência mínima</span>
                  <Badge variant="secondary">{generalSettings.minAdvanceTime} horas</Badge>
                </div>
                <Button variant="outline" className="w-full mt-2" onClick={() => setSettingsModalOpen(true)}>
                  Editar Configurações
                </Button>
              </div>
            </div>

            {/* Estados da Consulta */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Estados da Consulta</h3>
                    <p className="text-sm text-muted-foreground">Estados do sistema</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(appointmentStatusLabels).map(([key, label]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditHoursModal open={hoursModalOpen} onOpenChange={setHoursModalOpen} initialHours={workingHours} onSave={setWorkingHours} />
      <EditSettingsModal open={settingsModalOpen} onOpenChange={setSettingsModalOpen} initialSettings={generalSettings} onSave={setGeneralSettings} />
      <ManageProfessionalsModal open={professionalsModalOpen} onOpenChange={setProfessionalsModalOpen} />
      <ManageConsultationTypesModal open={typesModalOpen} onOpenChange={setTypesModalOpen} />
    </div>
  );
}
