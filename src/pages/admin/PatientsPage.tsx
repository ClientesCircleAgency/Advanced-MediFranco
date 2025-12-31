import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClinic } from '@/context/ClinicContext';
import { NewPatientModal } from '@/components/admin/NewPatientModal';
import { AppointmentWizard } from '@/components/admin/AppointmentWizard';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Patient } from '@/types/clinic';

export default function PatientsPage() {
  const navigate = useNavigate();
  const { patients, appointments, getPatientById } = useClinic();
  const [search, setSearch] = useState('');
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter((p) => {
    const searchLower = search.toLowerCase();
    return p.name.toLowerCase().includes(searchLower) || p.nif.includes(search) || p.phone.includes(search);
  });

  const getPatientAppointments = (patientId: string) => {
    const patientApts = appointments.filter((a) => a.patientId === patientId).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    const today = new Date().toISOString().split('T')[0];
    const past = patientApts.filter((a) => a.date < today || (a.date === today && a.status === 'completed'));
    const future = patientApts.filter((a) => a.date >= today && a.status !== 'completed' && a.status !== 'cancelled');
    return { last: past[past.length - 1], next: future[0] };
  };

  const handleNewAppointment = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setWizardOpen(true);
  };

  const handlePatientCreated = (patientId: string) => {
    const patient = getPatientById(patientId);
    if (patient) {
      navigate(`/admin/pacientes/${patientId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome, NIF ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button className="gap-2" onClick={() => setNewPatientOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Pacientes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{patients.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Novos este mês</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {patients.filter((p) => {
                const created = new Date(p.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Com consulta hoje</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Set(appointments.filter((a) => a.date === new Date().toISOString().split('T')[0]).map((a) => a.patientId)).size}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Resultados</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{filteredPatients.length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {search ? <p>Nenhum paciente encontrado para "{search}"</p> : <div><p className="text-lg font-medium">Sem pacientes registados</p><p className="text-sm">Adicione o primeiro paciente para começar</p></div>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>NIF</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Última Consulta</TableHead>
                  <TableHead>Próxima Consulta</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => {
                  const { last, next } = getPatientAppointments(patient.id);
                  return (
                    <TableRow key={patient.id} className="cursor-pointer" onClick={() => navigate(`/admin/pacientes/${patient.id}`)}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell className="font-mono">{patient.nif}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />{patient.phone}
                          {patient.email && (<><Mail className="h-3 w-3 ml-2" /><span className="truncate max-w-32">{patient.email}</span></>)}
                        </div>
                      </TableCell>
                      <TableCell>{last ? <span className="text-muted-foreground">{format(new Date(last.date), 'dd/MM/yyyy', { locale: pt })}</span> : <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell>{next ? <span className="text-primary font-medium">{format(new Date(next.date), 'dd/MM/yyyy', { locale: pt })}</span> : <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={(e) => handleNewAppointment(patient, e)}>
                          <Plus className="h-3 w-3 mr-1" />Consulta
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NewPatientModal open={newPatientOpen} onOpenChange={setNewPatientOpen} onPatientCreated={handlePatientCreated} />
      <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} preselectedPatient={selectedPatient} />
    </div>
  );
}
