import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon, Clock, User, FileText, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useClinic } from '@/context/ClinicContext';
import { PatientLookupByNIF } from './PatientLookupByNIF';
import { useToast } from '@/hooks/use-toast';
import type { Patient, AppointmentStatus } from '@/types/clinic';

interface AppointmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedPatient?: Patient | null;
  preselectedDate?: Date | null;
}

export function AppointmentWizard({
  open,
  onOpenChange,
  preselectedPatient,
  preselectedDate,
}: AppointmentWizardProps) {
  const { toast } = useToast();
  const {
    professionals,
    specialties,
    consultationTypes,
    rooms,
    addAppointment,
    getConsultationTypeById,
  } = useClinic();

  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(preselectedPatient || null);

  // Form state para passo 2
  const [formData, setFormData] = useState({
    consultationTypeId: '',
    professionalId: '',
    specialtyId: '',
    date: preselectedDate || new Date(),
    time: '09:00',
    duration: 30,
    status: 'scheduled' as AppointmentStatus,
    notes: '',
    roomId: '',
    sendConfirmation: true,
  });

  const resetForm = () => {
    setStep(1);
    setSelectedPatient(preselectedPatient || null);
    setFormData({
      consultationTypeId: '',
      professionalId: '',
      specialtyId: '',
      date: preselectedDate || new Date(),
      time: '09:00',
      duration: 30,
      status: 'scheduled',
      notes: '',
      roomId: '',
      sendConfirmation: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 200);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedPatient) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleConsultationTypeChange = (typeId: string) => {
    const type = getConsultationTypeById(typeId);
    setFormData({
      ...formData,
      consultationTypeId: typeId,
      duration: type?.defaultDuration || 30,
    });
  };

  const handleCreateAppointment = (createAnother: boolean = false) => {
    if (!selectedPatient || !formData.consultationTypeId || !formData.professionalId || !formData.date) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    addAppointment({
      patientId: selectedPatient.id,
      professionalId: formData.professionalId,
      specialtyId: formData.specialtyId || specialties[0]?.id || '',
      consultationTypeId: formData.consultationTypeId,
      date: format(formData.date, 'yyyy-MM-dd'),
      time: formData.time,
      duration: formData.duration,
      status: formData.status,
      notes: formData.notes || undefined,
      roomId: formData.roomId || undefined,
    });

    toast({
      title: 'Consulta criada',
      description: `Consulta agendada para ${format(formData.date, "d 'de' MMMM", { locale: pt })} às ${formData.time}`,
    });

    if (createAnother) {
      resetForm();
    } else {
      handleClose();
    }
  };

  // Gerar lista de horários
  const timeSlots = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 1 ? (
              <>
                <User className="h-5 w-5" />
                Nova Consulta - Identificar Paciente
              </>
            ) : (
              <>
                <CalendarIcon className="h-5 w-5" />
                Nova Consulta - Detalhes
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 py-2">
          <div
            className={cn(
              'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium',
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {step > 1 ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <div className={cn('flex-1 h-1 rounded', step > 1 ? 'bg-primary' : 'bg-muted')} />
          <div
            className={cn(
              'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium',
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            2
          </div>
        </div>

        {/* Passo 1 - Identificar Paciente */}
        {step === 1 && (
          <div className="space-y-4">
            <PatientLookupByNIF
              onPatientSelect={handlePatientSelect}
              selectedPatient={selectedPatient}
              onClear={() => setSelectedPatient(null)}
            />

            <div className="flex justify-end pt-4">
              <Button onClick={handleNextStep} disabled={!selectedPatient}>
                Continuar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Passo 2 - Detalhes da Marcação */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Info do paciente selecionado */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Paciente</p>
              <p className="font-medium">{selectedPatient?.name}</p>
            </div>

            {/* Tipo de Consulta */}
            <div className="space-y-2">
              <Label>Tipo de Consulta *</Label>
              <Select value={formData.consultationTypeId} onValueChange={handleConsultationTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {consultationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.defaultDuration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Profissional */}
            <div className="space-y-2">
              <Label>Profissional *</Label>
              <Select
                value={formData.professionalId}
                onValueChange={(v) => setFormData({ ...formData, professionalId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar profissional" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: prof.color }} />
                        {prof.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Especialidade */}
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Select
                value={formData.specialtyId}
                onValueChange={(v) => setFormData({ ...formData, specialtyId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar especialidade" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {specialties.map((spec) => (
                    <SelectItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.date, 'dd/MM/yyyy', { locale: pt })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({ ...formData, date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Hora *</Label>
                <Select value={formData.time} onValueChange={(v) => setFormData({ ...formData, time: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50 max-h-60">
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duração e Sala */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duração</Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(v) => setFormData({ ...formData, duration: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sala/Gabinete</Label>
                <Select value={formData.roomId} onValueChange={(v) => setFormData({ ...formData, roomId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Notas sobre a marcação..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Enviar confirmação */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendConfirmation"
                checked={formData.sendConfirmation}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, sendConfirmation: checked as boolean })
                }
              />
              <Label htmlFor="sendConfirmation" className="text-sm font-normal cursor-pointer">
                Enviar confirmação ao paciente (SMS/Email)
              </Label>
            </div>

            {/* Botões */}
            <div className="flex justify-between pt-4 gap-2">
              <Button variant="outline" onClick={handlePrevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleCreateAppointment(true)}>
                  Criar e Criar Outra
                </Button>
                <Button onClick={() => handleCreateAppointment(false)}>
                  Criar Consulta
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
