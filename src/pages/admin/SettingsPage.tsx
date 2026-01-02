import { useState } from 'react';
import { Clock, Users, Settings2, Tag, Plus, MoreHorizontal, Save, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { PageHeader } from '@/components/admin/PageHeader';
import { EditHoursModal } from '@/components/admin/EditHoursModal';
import { EditSettingsModal } from '@/components/admin/EditSettingsModal';
import { ManageProfessionalsModal } from '@/components/admin/ManageProfessionalsModal';
import { ManageConsultationTypesModal } from '@/components/admin/ManageConsultationTypesModal';

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

  const [rules, setRules] = useState({
    preventOverlap: true,
    smsReminders: true,
    suggestNextSlot: false,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Definições da Clínica"
        subtitle="Gerencie horários, equipa e regras do sistema."
        actions={
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Alterações
          </Button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Coluna esquerda */}
        <div className="space-y-6">
          {/* Horário de Funcionamento */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Horário de Funcionamento</h3>
                <div className="mt-4 space-y-3">
                  {workingHours.slice(0, 3).map((schedule) => (
                    <div key={schedule.day} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={schedule.enabled} 
                          onCheckedChange={(checked) => {
                            setWorkingHours(prev => prev.map(h => 
                              h.day === schedule.day ? { ...h, enabled: checked } : h
                            ));
                          }}
                          className="data-[state=checked]:bg-primary"
                        />
                        <span className={schedule.enabled ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                          {schedule.day}
                        </span>
                      </div>
                      {schedule.enabled ? (
                        <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                          {schedule.start} - {schedule.end}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Fechado</span>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Switch disabled checked={false} />
                      <span>Domingo</span>
                    </div>
                    <span className="text-sm">Fechado</span>
                  </div>
                </div>
                <Button 
                  variant="link" 
                  className="mt-4 p-0 h-auto text-primary"
                  onClick={() => setHoursModalOpen(true)}
                >
                  Editar exceções de feriados
                </Button>
              </div>
            </div>
          </div>

          {/* Regras Automáticas */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Regras Automáticas</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Evitar sobreposição de horários</span>
                    <Switch 
                      checked={rules.preventOverlap} 
                      onCheckedChange={(checked) => setRules(prev => ({ ...prev, preventOverlap: checked }))}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Lembretes por SMS</span>
                    <Switch 
                      checked={rules.smsReminders} 
                      onCheckedChange={(checked) => setRules(prev => ({ ...prev, smsReminders: checked }))}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Sugerir próxima vaga livre</span>
                    <Switch 
                      checked={rules.suggestNextSlot} 
                      onCheckedChange={(checked) => setRules(prev => ({ ...prev, suggestNextSlot: checked }))}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-6">
          {/* Equipa Médica */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Equipa Médica</h3>
                    <p className="text-sm text-muted-foreground">Gerir acesso e disponibilidade dos doutores.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setProfessionalsModalOpen(true)}>
                  <Plus className="h-3 w-3" />
                  Adicionar Novo
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {professionals.map((prof) => (
                  <div key={prof.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: prof.color }}
                      >
                        {prof.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{prof.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {prof.specialty} • <span className="text-green-600">Ativo</span>
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tipos de Consulta */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Tag className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Tipos de Consulta</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {consultationTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                    <span className="text-sm font-medium text-foreground">{type.name}</span>
                    <span className="text-sm text-primary font-medium">{type.defaultDuration} min</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parâmetros Gerais */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Settings2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Parâmetros Gerais</h3>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Duração Padrão</label>
                  <Select 
                    value={String(generalSettings.defaultDuration)} 
                    onValueChange={(v) => setGeneralSettings(prev => ({ ...prev, defaultDuration: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Intervalo (Buffer)</label>
                  <Select 
                    value={String(generalSettings.bufferTime)} 
                    onValueChange={(v) => setGeneralSettings(prev => ({ ...prev, bufferTime: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 minutos</SelectItem>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Antecedência Mínima</label>
                  <Select 
                    value={String(generalSettings.minAdvanceTime)} 
                    onValueChange={(v) => setGeneralSettings(prev => ({ ...prev, minAdvanceTime: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
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
