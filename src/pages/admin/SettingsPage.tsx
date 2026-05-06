import { useState } from 'react';
import { Clock, Users, Settings2, Tag, Plus, MoreHorizontal, Save, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinic } from '@/context/ClinicContext';
import { EditHoursModal } from '@/components/admin/EditHoursModal';
import { EditSettingsModal } from '@/components/admin/EditSettingsModal';
import { ManageProfessionalsModal } from '@/components/admin/ManageProfessionalsModal';
import { ManageConsultationTypesModal } from '@/components/admin/ManageConsultationTypesModal';
import { PageHeader } from '@/components/admin/PageHeader';
import { cn } from '@/lib/utils';

const shellCardClassName =
  'rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-cyan-950/5 backdrop-blur-sm';

export default function SettingsPage() {
  const { professionals, consultationTypes } = useClinic();

  const [hoursModalOpen, setHoursModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [professionalsModalOpen, setProfessionalsModalOpen] = useState(false);
  const [typesModalOpen, setTypesModalOpen] = useState(false);

  const [workingHours, setWorkingHours] = useState([
    { day: 'Segunda', start: '09:00', end: '19:00', enabled: true },
    { day: 'Terca', start: '09:00', end: '19:00', enabled: true },
    { day: 'Quarta', start: '09:00', end: '19:00', enabled: true },
    { day: 'Quinta', start: '09:00', end: '19:00', enabled: true },
    { day: 'Sexta', start: '09:00', end: '18:00', enabled: true },
    { day: 'Sabado', start: '09:00', end: '13:00', enabled: true },
    { day: 'Domingo', start: '', end: '', enabled: false },
  ]);

  const [generalSettings, setGeneralSettings] = useState({
    defaultDuration: 30,
    bufferTime: 5,
    minAdvanceTime: 2,
    averageConsultationValue: 50,
  });

  const [rules, setRules] = useState({
    preventOverlap: true,
    smsReminders: true,
    suggestNextSlot: false,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Ops Control"
        title="Configurações"
        subtitle="Parâmetros clínicos, equipa e regras automáticas com uma superfície mais limpa e consistente."
        actions={
          <Button size="sm" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Profissionais</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{professionals.length}</p>
          <p className="mt-2 text-sm text-slate-500">Recursos atualmente visíveis para a operação.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Tipos de consulta</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{consultationTypes.length}</p>
          <p className="mt-2 text-sm text-slate-500">Catálogo clínico disponível para marcação e gestão.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Duração padrão</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{generalSettings.defaultDuration}m</p>
          <p className="mt-2 text-sm text-slate-500">Base usada pela agenda para novas marcações.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="space-y-5">
          <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-950">Horário de funcionamento</h3>
                <p className="mt-1 text-sm text-slate-500">Visão rápida do calendário operativo da clínica.</p>
              </div>
            </div>
            <div className="space-y-3">
              {workingHours.slice(0, 4).map((schedule) => (
                <div key={schedule.day} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => {
                        setWorkingHours((current) => current.map((item) => (item.day === schedule.day ? { ...item, enabled: checked } : item)));
                      }}
                      className="data-[state=checked]:bg-cyan-600"
                    />
                    <span className={cn('text-sm', schedule.enabled ? 'font-medium text-slate-900' : 'text-slate-400')}>{schedule.day}</span>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-mono text-slate-500 shadow-sm">
                    {schedule.enabled ? `${schedule.start}-${schedule.end}` : 'Fechado'}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 rounded-2xl px-0 text-cyan-700 hover:bg-transparent hover:text-cyan-800" onClick={() => setHoursModalOpen(true)}>
              Ver horário completo
            </Button>
          </div>

          <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-950">Regras automáticas</h3>
                <p className="mt-1 text-sm text-slate-500">Regras essenciais para manter uma agenda previsível.</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { key: 'preventOverlap', label: 'Evitar sobreposição' },
                { key: 'smsReminders', label: 'Lembretes SMS' },
                { key: 'suggestNextSlot', label: 'Sugerir próxima vaga' },
              ].map((rule) => (
                <div key={rule.key} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">{rule.label}</span>
                  <Switch
                    checked={rules[rule.key as keyof typeof rules]}
                    onCheckedChange={(checked) => setRules((current) => ({ ...current, [rule.key]: checked }))}
                    className="data-[state=checked]:bg-cyan-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-slate-950">Equipa médica</h3>
                  <p className="mt-1 text-sm text-slate-500">Recursos humanos ativos no sistema.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-2xl border-slate-200 bg-slate-50" onClick={() => setProfessionalsModalOpen(true)}>
                <Plus className="mr-2 h-3.5 w-3.5" />
                Novo
              </Button>
            </div>
            <div className="space-y-3">
              {professionals.map((professional) => (
                <div key={professional.id} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: professional.color }}
                    >
                      {professional.name
                        .split(' ')
                        .map((name) => name[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{professional.name}</p>
                      <p className="truncate text-xs text-slate-500">{professional.specialty}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-2xl text-slate-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-950">Tipos de consulta</h3>
                <p className="mt-1 text-sm text-slate-500">Catálogo clínico com duração e leitura direta.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {consultationTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="truncate text-sm font-medium text-slate-900">{type.name}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-cyan-700 shadow-sm">{type.defaultDuration}m</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-950">Parâmetros gerais</h3>
                <p className="mt-1 text-sm text-slate-500">Defaults que moldam a agenda e a marcação.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-500">Duração</label>
                <Select value={String(generalSettings.defaultDuration)} onValueChange={(value) => setGeneralSettings((current) => ({ ...current, defaultDuration: Number(value) }))}>
                  <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-500">Buffer</label>
                <Select value={String(generalSettings.bufferTime)} onValueChange={(value) => setGeneralSettings((current) => ({ ...current, bufferTime: Number(value) }))}>
                  <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 min</SelectItem>
                    <SelectItem value="5">5 min</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-500">Antecedência</label>
                <Select value={String(generalSettings.minAdvanceTime)} onValueChange={(value) => setGeneralSettings((current) => ({ ...current, minAdvanceTime: Number(value) }))}>
                  <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1h</SelectItem>
                    <SelectItem value="2">2h</SelectItem>
                    <SelectItem value="4">4h</SelectItem>
                    <SelectItem value="24">24h</SelectItem>
                  </SelectContent>
                </Select>
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
