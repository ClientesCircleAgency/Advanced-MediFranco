import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Phone, Mail, Users, UserPlus, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClinic } from '@/context/ClinicContext';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { EmptyState } from '@/components/admin/EmptyState';
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
  const [activeTab, setActiveTab] = useState('all');

  const filteredPatients = patients.filter((p) => {
    const searchLower = search.toLowerCase();
    return p.name.toLowerCase().includes(searchLower) || p.nif.includes(search) || p.phone.includes(search);
  });

  // Estatísticas
  const newThisMonth = patients.filter((p) => {
    const created = new Date(p.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const todayDate = new Date().toISOString().split('T')[0];
  const withAppointmentToday = new Set(
    appointments.filter((a) => a.date === todayDate).map((a) => a.patientId)
  ).size;

  const getPatientAppointments = (patientId: string) => {
    const patientApts = appointments
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    const today = todayDate;
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
    navigate(`/admin/pacientes/${patientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Barra de pesquisa e filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, telemóvel ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 bg-card border-border rounded-xl"
          />
        </div>
        <Button variant="outline" className="gap-2 h-12 px-5">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Área de conteúdo */}
      <div className="bg-card border border-border rounded-2xl min-h-[400px]">
        {filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Base de Pacientes</h3>
            <p className="text-sm text-muted-foreground">
              {search ? `Nenhum resultado para "${search}"` : 'A sua lista está sincronizada. Comece a digitar para encontrar fichas.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">NIF</TableHead>
                <TableHead className="font-semibold">Contacto</TableHead>
                <TableHead className="font-semibold">Última Consulta</TableHead>
                <TableHead className="font-semibold">Próxima Consulta</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const { last, next } = getPatientAppointments(patient.id);
                return (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => navigate(`/admin/pacientes/${patient.id}`)}
                  >
                    <TableCell className="font-medium text-foreground">{patient.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{patient.nif}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </span>
                        {patient.email && (
                          <span className="flex items-center gap-1 truncate max-w-32">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {last ? (
                        <span className="text-muted-foreground">
                          {format(new Date(last.date), 'dd/MM/yyyy', { locale: pt })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {next ? (
                        <span className="text-primary font-medium">
                          {format(new Date(next.date), 'dd/MM/yyyy', { locale: pt })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleNewAppointment(patient, e)}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Consulta
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <NewPatientModal open={newPatientOpen} onOpenChange={setNewPatientOpen} onPatientCreated={handlePatientCreated} />
      <AppointmentWizard open={wizardOpen} onOpenChange={setWizardOpen} preselectedPatient={selectedPatient} />
    </div>
  );
}
