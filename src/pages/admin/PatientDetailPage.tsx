import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Calendar, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { AppointmentWizard } from '@/components/admin/AppointmentWizard';
import { appointmentStatusLabels } from '@/types/clinic';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { PageHeader } from '@/components/admin/PageHeader';
import { cn } from '@/lib/utils';

const shellCardClassName =
  'rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-cyan-950/5 backdrop-blur-sm';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatientById, getAppointmentsByPatient, getProfessionalById, getConsultationTypeById } = useClinic();
  const [wizardOpen, setWizardOpen] = useState(false);

  const patient = getPatientById(id || '');
  const appointments = getAppointmentsByPatient(id || '').sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  if (!patient) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Paciente não encontrado</p>
        <Button variant="outline" onClick={() => navigate('/admin/pacientes')} className="mt-4 rounded-2xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      waiting: 'border-amber-200 bg-amber-50 text-amber-700',
      in_progress: 'border-violet-200 bg-violet-50 text-violet-700',
      completed: 'border-slate-200 bg-slate-100 text-slate-700',
      cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
      no_show: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
    };
    return colors[status] || 'border-slate-200 bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Patient Profile"
        title={patient.name}
        subtitle={`NIF ${patient.nif} • visão consolidada da ficha, contactos e histórico clínico.`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="rounded-2xl border-white/10 bg-white/10 text-white hover:bg-white/15" onClick={() => navigate('/admin/pacientes')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100" onClick={() => setWizardOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova consulta
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
        <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
          <h3 className="font-display text-lg font-semibold text-slate-950">Dados pessoais</h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{patient.phone}</span>
            </div>
            {patient.email && (
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{patient.email}</span>
              </div>
            )}
            {patient.birthDate && (
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>{format(new Date(patient.birthDate), 'dd/MM/yyyy', { locale: pt })}</span>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Registado em</p>
            <p className="mt-2 text-sm text-slate-700">{format(new Date(patient.createdAt), "d 'de' MMMM 'de' yyyy", { locale: pt })}</p>
          </div>

          {patient.tags && patient.tags.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-slate-700">Tags</p>
              <div className="flex flex-wrap gap-2">
                {patient.tags.map((tag) => (
                  <Badge key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {patient.notes && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-slate-700">Observações</p>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {patient.notes}
              </div>
            </div>
          )}
        </div>

        <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-950">Histórico de consultas</h3>
              <p className="text-sm text-slate-500">{appointments.length} registos associados a esta ficha.</p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">Sem histórico de consultas</p>
              <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => setWizardOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agendar primeira consulta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => {
                const professional = getProfessionalById(appointment.professionalId);
                const consultationType = getConsultationTypeById(appointment.consultationTypeId);

                return (
                  <div key={appointment.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:shadow-lg">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="min-w-16 text-center">
                          <p className="text-2xl font-semibold text-slate-950">{format(new Date(appointment.date), 'dd', { locale: pt })}</p>
                          <p className="text-xs uppercase tracking-wide text-slate-400">{format(new Date(appointment.date), 'MMM yyyy', { locale: pt })}</p>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-slate-900">{appointment.time}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-700">{consultationType?.name || 'Consulta'}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{professional?.name}</p>
                        </div>
                      </div>
                      <Badge className={cn('rounded-full border px-3 py-1 text-xs font-medium', getStatusColor(appointment.status))}>
                        {appointmentStatusLabels[appointment.status]}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} preselectedPatient={patient} />
    </div>
  );
}
