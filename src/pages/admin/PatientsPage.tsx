import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Phone, Users, Filter, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClinic } from '@/context/ClinicContext';
import { PageHeader } from '@/components/admin/PageHeader';
import { NewPatientModal } from '@/components/admin/NewPatientModal';
import { AppointmentWizard } from '@/components/admin/AppointmentWizard';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Patient } from '@/types/clinic';
import { cn } from '@/lib/utils';

const shellCardClassName =
  'rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-cyan-950/5 backdrop-blur-sm';

export default function PatientsPage() {
  const navigate = useNavigate();
  const { patients, appointments } = useClinic();
  const [search, setSearch] = useState('');
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchLower = search.toLowerCase();
      return (
        patient.name.toLowerCase().includes(searchLower) ||
        patient.nif.includes(search) ||
        patient.phone.includes(search)
      );
    });
  }, [patients, search]);

  const newThisMonth = patients.filter((patient) => {
    const created = new Date(patient.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const todayDate = new Date().toISOString().split('T')[0];
  const withAppointmentToday = new Set(appointments.filter((appointment) => appointment.date === todayDate).map((appointment) => appointment.patientId)).size;

  const getPatientAppointments = (patientId: string) => {
    const patientAppointments = appointments
      .filter((appointment) => appointment.patientId === patientId)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    const past = patientAppointments.filter((appointment) => appointment.date < todayDate || (appointment.date === todayDate && appointment.status === 'completed'));
    const future = patientAppointments.filter(
      (appointment) => appointment.date >= todayDate && appointment.status !== 'completed' && appointment.status !== 'cancelled'
    );
    return { last: past[past.length - 1], next: future[0] };
  };

  const handleNewAppointment = (patient: Patient, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedPatient(patient);
    setWizardOpen(true);
  };

  const handlePatientCreated = (patientId: string) => {
    navigate(`/admin/pacientes/${patientId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Patient Registry"
        title="Pacientes"
        subtitle={`${patients.length} pacientes registados, com foco em leitura rápida e contexto clínico limpo.`}
        actions={
          <Button onClick={() => setNewPatientOpen(true)} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
            <Plus className="mr-2 h-4 w-4" />
            Novo paciente
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Base ativa</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{patients.length}</p>
          <p className="mt-2 text-sm text-slate-500">Todas as fichas disponíveis para operação clínica.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Novos este mês</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{newThisMonth}</p>
          <p className="mt-2 text-sm text-slate-500">Crescimento recente da base de pacientes.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Com consulta hoje</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{withAppointmentToday}</p>
          <p className="mt-2 text-sm text-slate-500">Pacientes que cruzam a agenda de hoje.</p>
        </div>
      </div>

      <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-slate-950">Explorar pacientes</h2>
            <p className="mt-1 text-sm text-slate-500">Lista mais calma, legível e alinhada com o sistema da dashboard.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="relative flex-1 lg:min-w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Pesquisar por nome, NIF ou telefone..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-10 shadow-none"
              />
            </div>
            <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filteredPatients.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-700">Sem resultados para esta pesquisa</p>
              <p className="mt-1 text-sm text-slate-500">{search ? `Nenhum paciente corresponde a "${search}".` : 'Comece a escrever para encontrar uma ficha.'}</p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const { last, next } = getPatientAppointments(patient.id);
              return (
                <button
                  key={patient.id}
                  type="button"
                  className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-4 text-left transition hover:border-cyan-200 hover:shadow-lg"
                  onClick={() => navigate(`/admin/pacientes/${patient.id}`)}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="truncate text-base font-semibold text-slate-950">{patient.name}</p>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-mono text-slate-500">
                          {patient.nif}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {patient.phone}
                        </span>
                        {next && (
                          <span className="flex items-center gap-1.5 text-cyan-700">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Próx: {format(new Date(next.date), 'dd/MM/yy', { locale: pt })}
                          </span>
                        )}
                        {last && (
                          <span className="text-slate-400">
                            Última: {format(new Date(last.date), 'dd/MM/yy', { locale: pt })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-2xl border-slate-200 bg-slate-50 hover:bg-slate-100"
                        onClick={(event) => handleNewAppointment(patient, event)}
                      >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Consulta
                      </Button>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <NewPatientModal open={newPatientOpen} onOpenChange={setNewPatientOpen} onPatientCreated={handlePatientCreated} />
      <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} preselectedPatient={selectedPatient} />
    </div>
  );
}
