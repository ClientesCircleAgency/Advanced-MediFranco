import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Calendar,
  CalendarPlus,
  Eye,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Smile,
  User,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppointmentRequests, useUpdateAppointmentRequestStatus, type AppointmentRequest } from '@/hooks/useAppointmentRequests';
import { useContactMessages, useUpdateContactMessageStatus, type ContactMessage } from '@/hooks/useContactMessages';
import { usePatients, useAddPatient } from '@/hooks/usePatients';
import { useAddAppointment } from '@/hooks/useAppointments';
import { useSpecialties } from '@/hooks/useSpecialties';
import { useConsultationTypes } from '@/hooks/useConsultationTypes';
import { useProfessionals } from '@/hooks/useProfessionals';
import { SuggestAlternativesModal } from '@/components/admin/SuggestAlternativesModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function shellCardClassName(interactive = false) {
  return cn(
    'rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-cyan-950/5 backdrop-blur-sm',
    interactive && 'transition hover:border-cyan-200 hover:shadow-lg'
  );
}

function requestStatusBadge(status: AppointmentRequest['status']) {
  const styles: Record<AppointmentRequest['status'], string> = {
    pending: 'border-amber-300 bg-amber-50 text-amber-700',
    approved: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    rejected: 'border-rose-300 bg-rose-50 text-rose-700',
    converted: 'border-cyan-300 bg-cyan-50 text-cyan-700',
  };

  const labels: Record<AppointmentRequest['status'], string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    converted: 'Convertido',
  };

  return <Badge className={cn('rounded-full border px-3 py-1 text-xs font-medium', styles[status])}>{labels[status]}</Badge>;
}

function messageStatusBadge(status: ContactMessage['status']) {
  if (status === 'new') {
    return <Badge className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">Nova</Badge>;
  }

  return <Badge className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">Lida</Badge>;
}

export default function RequestsPage() {
  const { data: requests = [], isLoading: loadingRequests } = useAppointmentRequests();
  const { data: messages = [], isLoading: loadingMessages } = useContactMessages();
  const { data: patients = [] } = usePatients();
  const { data: specialties = [] } = useSpecialties();
  const { data: consultationTypes = [] } = useConsultationTypes();
  const { data: professionals = [] } = useProfessionals();

  const updateRequestStatus = useUpdateAppointmentRequestStatus();
  const updateMessageStatus = useUpdateContactMessageStatus();
  const addPatient = useAddPatient();
  const addAppointment = useAddAppointment();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const dashboard = useMemo(() => {
    const pendingRequests = requests.filter((request) => request.status === 'pending');
    const processedRequests = requests.filter((request) => request.status !== 'pending');
    const newMessages = messages.filter((message) => message.status === 'new');
    const visibleMessages = messages.filter((message) => message.status !== 'archived');

    return {
      pendingRequests,
      processedRequests,
      newMessages,
      visibleMessages,
    };
  }, [messages, requests]);

  const filteredRequests = dashboard.pendingRequests.filter(
    (request) =>
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.nif.includes(searchQuery) ||
      request.phone.includes(searchQuery)
  );

  const handleConvertToAppointment = async () => {
    if (!selectedRequest) return;

    setIsConverting(true);
    try {
      let patient = patients.find((candidate) => candidate.nif === selectedRequest.nif);

      if (!patient) {
        patient = await addPatient.mutateAsync({
          nif: selectedRequest.nif,
          name: selectedRequest.name,
          phone: selectedRequest.phone,
          email: selectedRequest.email,
        });
      }

      const specialty = specialties.find((specialtyOption) =>
        selectedRequest.service_type === 'oftalmologia'
          ? specialtyOption.name.toLowerCase().includes('oftalmo')
          : specialtyOption.name.toLowerCase().includes('dent')
      );

      const consultationType = consultationTypes[0];
      const professional = professionals.find((candidate) => candidate.specialty_id === specialty?.id) || professionals[0];

      if (!specialty || !consultationType || !professional) {
        toast.error('Configuracao incompleta. Verifique especialidades e profissionais.');
        return;
      }

      await addAppointment.mutateAsync({
        patient_id: patient.id,
        professional_id: professional.id,
        specialty_id: specialty.id,
        consultation_type_id: consultationType.id,
        date: selectedRequest.preferred_date,
        time: selectedRequest.preferred_time,
        duration: consultationType.default_duration,
        status: 'confirmed',
        notes: `Convertido de pedido online. NIF: ${selectedRequest.nif}`,
      });

      await updateRequestStatus.mutateAsync({ id: selectedRequest.id, status: 'converted' });

      toast.success('Consulta confirmada criada com sucesso.');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error converting request:', error);
      toast.error('Erro ao converter pedido');
    } finally {
      setIsConverting(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateRequestStatus.mutateAsync({ id, status: 'rejected' });
      toast.success('Pedido rejeitado');
      setSelectedRequest(null);
    } catch {
      toast.error('Erro ao rejeitar pedido');
    }
  };

  const handleMarkMessageRead = async (id: string) => {
    try {
      await updateMessageStatus.mutateAsync({ id, status: 'read' });
    } catch {
      toast.error('Erro ao atualizar mensagem');
    }
  };

  const handleArchiveMessage = async (id: string) => {
    try {
      await updateMessageStatus.mutateAsync({ id, status: 'archived' });
      toast.success('Mensagem arquivada');
      setSelectedMessage(null);
    } catch {
      toast.error('Erro ao arquivar mensagem');
    }
  };

  if (loadingRequests || loadingMessages) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Operations"
        title="Pedidos"
        subtitle={`${dashboard.pendingRequests.length} pedidos pendentes • ${dashboard.newMessages.length} mensagens novas`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn(shellCardClassName(), 'p-5')}>
          <p className="text-sm text-slate-500">Triage pendente</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{dashboard.pendingRequests.length}</p>
          <p className="mt-2 text-sm text-slate-500">Pedidos que ainda precisam de decisao ou conversao.</p>
        </div>
        <div className={cn(shellCardClassName(), 'p-5')}>
          <p className="text-sm text-slate-500">Mensagens em aberto</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{dashboard.newMessages.length}</p>
          <p className="mt-2 text-sm text-slate-500">Contactos novos por responder no front-office.</p>
        </div>
        <div className={cn(shellCardClassName(), 'p-5')}>
          <p className="text-sm text-slate-500">Historico processado</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{dashboard.processedRequests.length}</p>
          <p className="mt-2 text-sm text-slate-500">Pedidos que ja seguiram para conversao, aprovacao ou rejeicao.</p>
        </div>
      </div>

      <Tabs defaultValue="appointments" className="space-y-5">
        <TabsList className="h-auto rounded-[1.5rem] border border-slate-200 bg-white/85 p-1.5 shadow-sm">
          <TabsTrigger
            value="appointments"
            className="gap-2 rounded-[1.1rem] px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            <Calendar className="h-4 w-4" />
            Marcacoes
            {dashboard.pendingRequests.length > 0 && (
              <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] text-cyan-200 data-[state=inactive]:text-cyan-700">
                {dashboard.pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="gap-2 rounded-[1.1rem] px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            <Mail className="h-4 w-4" />
            Mensagens
            {dashboard.newMessages.length > 0 && (
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] text-rose-200 data-[state=inactive]:text-rose-700">
                {dashboard.newMessages.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-5">
          <div className={cn(shellCardClassName(), 'p-5 lg:p-6')}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-slate-950">Fila de triage</h2>
                <p className="mt-1 text-sm text-slate-500">Entrada de novos pedidos com foco em decisao rapida e contexto limpo.</p>
              </div>
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Pesquisar por nome, NIF ou telefone..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-10 shadow-none focus-visible:ring-cyan-300"
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {filteredRequests.length === 0 ? (
                <Card className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 shadow-none">
                  Nenhum pedido de marcacao pendente.
                </Card>
              ) : (
                filteredRequests.map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-4 text-left transition hover:border-cyan-200 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                            request.service_type === 'oftalmologia' ? 'bg-cyan-50 text-cyan-700' : 'bg-violet-50 text-violet-700'
                          )}
                        >
                          {request.service_type === 'oftalmologia' ? <Eye className="h-5 w-5" /> : <Smile className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-base font-semibold text-slate-950">{request.name}</p>
                            {requestStatusBadge(request.status)}
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            NIF: {request.nif} • {format(new Date(request.preferred_date), "d MMM", { locale: pt })} às {request.preferred_time}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">
                        {format(new Date(request.created_at), "d MMM", { locale: pt })}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {dashboard.processedRequests.length > 0 && (
            <div className={cn(shellCardClassName(), 'p-5 lg:p-6')}>
              <div className="mb-4">
                <h3 className="font-display text-lg font-semibold text-slate-950">Processados</h3>
                <p className="mt-1 text-sm text-slate-500">Historico recente para validacao rapida do que ja foi decidido.</p>
              </div>
              <div className="space-y-2">
                {dashboard.processedRequests.slice(0, 6).map((request) => (
                  <div key={request.id} className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-slate-900">{request.name}</p>
                      <span className="text-sm text-slate-400">{format(new Date(request.preferred_date), "d MMM", { locale: pt })}</span>
                    </div>
                    {requestStatusBadge(request.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-5">
          <div className={cn(shellCardClassName(), 'p-5 lg:p-6')}>
            <div className="mb-5">
              <h2 className="font-display text-xl font-semibold tracking-tight text-slate-950">Inbox operacional</h2>
              <p className="mt-1 text-sm text-slate-500">Mensagens organizadas para resposta rapida sem ruido visual.</p>
            </div>
            {dashboard.visibleMessages.length === 0 ? (
              <Card className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 shadow-none">
                Nenhuma mensagem recebida.
              </Card>
            ) : (
              <div className="space-y-3">
                {dashboard.visibleMessages.map((message) => (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => {
                      setSelectedMessage(message);
                      if (message.status === 'new') {
                        handleMarkMessageRead(message.id);
                      }
                    }}
                    className={cn(
                      'w-full rounded-[1.5rem] border bg-white p-4 text-left transition hover:border-cyan-200 hover:shadow-lg',
                      message.status === 'new' ? 'border-cyan-200' : 'border-slate-200'
                    )}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-950">{message.name}</p>
                          {messageStatusBadge(message.status)}
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-slate-500">{message.message}</p>
                      </div>
                      <span className="text-sm text-slate-400">
                        {format(new Date(message.created_at), "d MMM HH:mm", { locale: pt })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-xl rounded-[2rem] border-slate-200 bg-white p-0">
          {selectedRequest && (
            <div className="overflow-hidden rounded-[2rem]">
              <div className="bg-slate-950 px-6 py-5 text-white">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">Pedido de marcacao</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Reve o contexto do pedido e decide a proxima acao operacional.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="space-y-5 px-6 py-6">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-[1.25rem]',
                      selectedRequest.service_type === 'oftalmologia' ? 'bg-cyan-50 text-cyan-700' : 'bg-violet-50 text-violet-700'
                    )}
                  >
                    {selectedRequest.service_type === 'oftalmologia' ? <Eye className="h-6 w-6" /> : <Smile className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{selectedRequest.name}</p>
                    <p className="text-sm text-slate-500">
                      {selectedRequest.service_type === 'oftalmologia' ? 'Oftalmologia' : 'Medicina Dentaria'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>NIF: {selectedRequest.nif}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <a href={`tel:${selectedRequest.phone}`} className="text-cyan-700 hover:underline">
                      {selectedRequest.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a href={`mailto:${selectedRequest.email}`} className="text-cyan-700 hover:underline">
                      {selectedRequest.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>
                      {format(new Date(selectedRequest.preferred_date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })} às{' '}
                      {selectedRequest.preferred_time}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Recebido: {format(new Date(selectedRequest.created_at), "d MMM yyyy 'às' HH:mm", { locale: pt })}
                </p>

                {selectedRequest.status === 'pending' && (
                  <DialogFooter className="flex-col gap-3 sm:flex-col">
                    <div className="flex w-full flex-col gap-3 sm:flex-row">
                      <Button className="flex-1 rounded-2xl" onClick={handleConvertToAppointment} disabled={isConverting}>
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        {isConverting ? 'A converter...' : 'Confirmar horario'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-2xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setShowAlternativesModal(true)}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Sugerir alternativas
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full rounded-2xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={updateRequestStatus.isPending}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rejeitar pedido
                    </Button>
                  </DialogFooter>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-xl rounded-[2rem] border-slate-200 bg-white p-0">
          {selectedMessage && (
            <div className="overflow-hidden rounded-[2rem]">
              <div className="bg-slate-950 px-6 py-5 text-white">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">Mensagem</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Contexto de contacto do site principal.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{selectedMessage.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <a href={`mailto:${selectedMessage.email}`} className="hover:text-cyan-700">
                      {selectedMessage.email}
                    </a>
                    <a href={`tel:${selectedMessage.phone}`} className="hover:text-cyan-700">
                      {selectedMessage.phone}
                    </a>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-slate-700">{selectedMessage.message}</p>
                </div>

                <p className="text-xs text-slate-400">
                  Recebido: {format(new Date(selectedMessage.created_at), "d MMM yyyy 'às' HH:mm", { locale: pt })}
                </p>

                <DialogFooter className="gap-3">
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => handleArchiveMessage(selectedMessage.id)}
                    disabled={updateMessageStatus.isPending}
                  >
                    Arquivar
                  </Button>
                  <Button asChild className="rounded-2xl">
                    <a href={`mailto:${selectedMessage.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Responder
                    </a>
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SuggestAlternativesModal
        open={showAlternativesModal}
        onOpenChange={setShowAlternativesModal}
        request={selectedRequest}
      />
    </div>
  );
}
