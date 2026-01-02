import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClinic } from '@/context/ClinicContext';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

interface NewPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated?: (patientId: string) => void;
}

export function NewPatientModal({ open, onOpenChange, onPatientCreated }: NewPatientModalProps) {
  const { addPatient, findPatientByNif } = useClinic();

  const [nif, setNif] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const [nifError, setNifError] = useState('');

  const validateNif = (value: string) => {
    // Limpar erro
    setNifError('');

    // Verificar formato
    if (value.length === 9) {
      // Verificar se já existe
      const existing = findPatientByNif(value);
      if (existing) {
        setNifError(`NIF já registado para: ${existing.name}`);
        return false;
      }
    }
    return true;
  };

  const handleNifChange = (value: string) => {
    // Apenas números
    const cleaned = value.replace(/\D/g, '').slice(0, 9);
    setNif(cleaned);
    if (cleaned.length === 9) {
      validateNif(cleaned);
    } else {
      setNifError('');
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (nif.length !== 9) {
      toast.error('NIF deve ter 9 dígitos');
      return;
    }

    if (!validateNif(nif)) {
      return;
    }

    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!phone.trim()) {
      toast.error('Telefone é obrigatório');
      return;
    }

    const newPatient = await addPatient({
      nif,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      birthDate: birthDate || undefined,
      notes: notes.trim() || undefined,
    });

    toast.success('Paciente criado com sucesso');
    onPatientCreated?.(newPatient.id);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setNif('');
    setName('');
    setPhone('');
    setEmail('');
    setBirthDate('');
    setNotes('');
    setNifError('');
  };

  const isValid = nif.length === 9 && !nifError && name.trim() && phone.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* NIF */}
          <div className="space-y-2">
            <Label>NIF *</Label>
            <Input
              value={nif}
              onChange={(e) => handleNifChange(e.target.value)}
              placeholder="123456789"
              maxLength={9}
              className={nifError ? 'border-destructive' : ''}
            />
            {nifError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {nifError}
              </p>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label>Nome Completo *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do paciente"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label>Telefone *</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="912 345 678"
              type="tel"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              type="email"
            />
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-2">
            <Label>Data de Nascimento</Label>
            <Input
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              type="date"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas sobre o paciente..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Criar Paciente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
