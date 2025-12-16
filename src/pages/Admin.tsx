import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  CalendarDays,
  MessageSquare,
  LogOut,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Mail,
  Phone,
  Archive,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Appointment, ContactMessage } from '@/types';
import { mockAppointments, mockMessages } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo-medifranco.png';

export default function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { toast } = useToast();
  
  // Initialize with mock data if empty
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('medifranco_appointments', mockAppointments);
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>('medifranco_messages', mockMessages);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const appointmentsForDate = selectedDate
    ? appointments.filter((a) => a.preferredDate === format(selectedDate, 'yyyy-MM-dd'))
    : [];

  const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;
  const newMessages = messages.filter((m) => m.status === 'new').length;

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
    setSelectedAppointment(null);
    toast({
      title: 'Marcação atualizada',
      description: `Estado alterado para ${status === 'confirmed' ? 'confirmada' : 'cancelada'}.`,
    });
  };

  const updateMessageStatus = (id: string, status: ContactMessage['status']) => {
    setMessages(messages.map((m) => (m.id === id ? { ...m, status } : m)));
    if (status === 'archived') {
      setSelectedMessage(null);
    }
    toast({
      title: 'Mensagem atualizada',
      description: status === 'read' ? 'Marcada como lida.' : 'Arquivada com sucesso.',
    });
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmada</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Cancelada</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pendente</Badge>;
    }
  };

  const getMessageStatusBadge = (status: ContactMessage['status']) => {
    switch (status) {
      case 'read':
        return <Badge variant="outline">Lida</Badge>;
      case 'archived':
        return <Badge variant="secondary">Arquivada</Badge>;
      default:
        return <Badge className="bg-primary/10 text-primary border-primary/20">Nova</Badge>;
    }
  };

  // Get dates with appointments for calendar highlighting
  const datesWithAppointments = appointments.map((a) => new Date(a.preferredDate));

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="MediFranco" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <h1 className="font-semibold text-foreground">Painel de Admin</h1>
              <p className="text-xs text-muted-foreground">Gestão de marcações e mensagens</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-background rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
                <p className="text-xs text-muted-foreground">Total Marcações</p>
              </div>
            </div>
          </div>
          <div className="bg-background rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingAppointments}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </div>
          <div className="bg-background rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{messages.length}</p>
                <p className="text-xs text-muted-foreground">Mensagens</p>
              </div>
            </div>
          </div>
          <div className="bg-background rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{newMessages}</p>
                <p className="text-xs text-muted-foreground">Novas Mensagens</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="appointments" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Marcações
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Mensagens
              {newMessages > 0 && (
                <Badge className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0">
                  {newMessages}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="bg-background rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold mb-4 text-foreground">Calendário</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md pointer-events-auto"
                  modifiers={{
                    hasAppointment: datesWithAppointments,
                  }}
                  modifiersStyles={{
                    hasAppointment: {
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                      textDecorationColor: 'hsl(var(--primary))',
                    },
                  }}
                />
              </div>

              {/* Appointments for selected date */}
              <div className="lg:col-span-2 bg-background rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold mb-4 text-foreground">
                  Marcações - {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: pt }) : 'Selecione uma data'}
                </h3>
                {appointmentsForDate.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">
                    Nenhuma marcação para esta data.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {appointmentsForDate.map((appointment) => (
                      <button
                        key={appointment.id}
                        onClick={() => setSelectedAppointment(appointment)}
                        className="w-full text-left p-4 rounded-lg border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{appointment.name}</span>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.preferredTime}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {appointment.serviceType === 'oftalmologia' ? 'Oftalmologia' : 'Medicina Dentária'}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* All Appointments List */}
            <div className="bg-background rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-4 text-foreground">Todas as Marcações</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        onClick={() => setSelectedAppointment(appointment)}
                        className="border-b last:border-0 hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-foreground">{appointment.name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{appointment.email}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {appointment.serviceType === 'oftalmologia' ? 'Oftalmo' : 'Dentária'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {format(new Date(appointment.preferredDate), 'dd/MM/yyyy')} - {appointment.preferredTime}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(appointment.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <div className="bg-background rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-4 text-foreground">Mensagens Recebidas</h3>
              <div className="space-y-3">
                {messages.filter((m) => m.status !== 'archived').map((message) => (
                  <button
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (message.status === 'new') {
                        updateMessageStatus(message.id, 'read');
                      }
                    }}
                    className="w-full text-left p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{message.name}</span>
                      {getMessageStatusBadge(message.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{message.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{message.email}</span>
                      <span>{format(new Date(message.createdAt), "dd/MM/yyyy 'às' HH:mm")}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Archived Messages */}
            <div className="bg-background rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-4 text-foreground text-muted-foreground">Mensagens Arquivadas</h3>
              <div className="space-y-3">
                {messages.filter((m) => m.status === 'archived').map((message) => (
                  <div
                    key={message.id}
                    className="p-4 rounded-lg border opacity-60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{message.name}</span>
                      {getMessageStatusBadge(message.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{message.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Appointment Detail Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Marcação</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">{selectedAppointment.name}</span>
                {getStatusBadge(selectedAppointment.status)}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${selectedAppointment.email}`} className="text-primary hover:underline">
                    {selectedAppointment.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${selectedAppointment.phone}`} className="text-primary hover:underline">
                    {selectedAppointment.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">NIF:</span>
                  <span className="text-foreground">{selectedAppointment.nif}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {format(new Date(selectedAppointment.preferredDate), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedAppointment.preferredTime}</span>
                </div>
                <div>
                  <Badge variant="outline">
                    {selectedAppointment.serviceType === 'oftalmologia' ? 'Oftalmologia' : 'Medicina Dentária'}
                  </Badge>
                </div>
              </div>

              {selectedAppointment.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'confirmed')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirmar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancelled')}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Detail Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mensagem de {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                    {selectedMessage.phone}
                  </a>
                </div>
                <div className="text-xs text-muted-foreground">
                  Recebida em {format(new Date(selectedMessage.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-foreground text-sm leading-relaxed">{selectedMessage.message}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `mailto:${selectedMessage.email}`}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Responder
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `tel:${selectedMessage.phone}`}
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                >
                  <Archive className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
