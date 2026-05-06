import { useMemo } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Inbox,
  MessageSquareMore,
  MonitorPlay,
  Stethoscope,
  Users,
  Video,
  Workflow,
} from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { useClinic } from '@/context/ClinicContext';
import { useAppointmentRequests } from '@/hooks/useAppointmentRequests';
import { useContactMessages } from '@/hooks/useContactMessages';
import { useOnlineAppointments } from '@/hooks/useOnlineAppointments';
import type { AppointmentStatus, OnlineAppointmentStatus } from '@/types/database';

type TimelineItem = {
  id: string;
  time: string;
  channel: 'presencial' | 'online';
  status: AppointmentStatus | OnlineAppointmentStatus;
  title: string;
  detail: string;
};

const waitingStatuses = new Set(['waiting', 'in_progress']);
const scheduledStatuses = new Set(['scheduled', 'pre_confirmed', 'confirmed', 'paid']);

const physicalStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Marcada',
  pre_confirmed: 'Pre-confirmada',
  confirmed: 'Confirmada',
  waiting: 'Em espera',
  in_progress: 'Em atendimento',
  completed: 'Concluida',
  cancelled: 'Cancelada',
  no_show: 'Nao compareceu',
};

const onlineStatusLabels: Record<OnlineAppointmentStatus, string> = {
  scheduled: 'Marcada',
  pre_confirmed: 'Pre-confirmada',
  confirmed: 'Confirmada',
  paid: 'Paga',
  waiting: 'Sala pronta',
  in_progress: 'Em videochamada',
  completed: 'Concluida',
  cancelled: 'Cancelada',
  no_show: 'Nao compareceu',
};

function channelBadge(channel: TimelineItem['channel']) {
  return channel === 'online'
    ? 'bg-cyan-400/15 text-cyan-200 border-cyan-400/20'
    : 'bg-emerald-400/15 text-emerald-200 border-emerald-400/20';
}

function statusTone(status: TimelineItem['status']) {
  if (waitingStatuses.has(status)) return 'bg-amber-400/15 text-amber-200 border-amber-400/20';
  if (status === 'completed') return 'bg-emerald-400/15 text-emerald-200 border-emerald-400/20';
  if (status === 'cancelled' || status === 'no_show') return 'bg-rose-400/15 text-rose-200 border-rose-400/20';
  return 'bg-slate-400/15 text-slate-200 border-slate-300/20';
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'cyan',
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number | string;
  hint: string;
  accent?: 'cyan' | 'emerald' | 'amber' | 'violet' | 'slate';
}) {
  const accentClasses = {
    cyan: 'bg-cyan-400/15 text-cyan-200 ring-cyan-300/20',
    emerald: 'bg-emerald-400/15 text-emerald-200 ring-emerald-300/20',
    amber: 'bg-amber-400/15 text-amber-200 ring-amber-300/20',
    violet: 'bg-violet-400/15 text-violet-200 ring-violet-300/20',
    slate: 'bg-slate-400/15 text-slate-200 ring-slate-300/20',
  };

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/90 p-5 text-white shadow-xl shadow-slate-950/15">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ring-1 ${accentClasses[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-400">{hint}</p>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-5 shadow-xl shadow-cyan-950/5 backdrop-blur-sm lg:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const { appointments, patients } = useClinic();
  const { data: requests = [] } = useAppointmentRequests();
  const { data: messages = [] } = useContactMessages();
  const { data: onlineAppointments = [] } = useOnlineAppointments();

  const currentDate = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt });

  const dashboard = useMemo(() => {
    const todayPhysical = appointments.filter((appointment) => isToday(parseISO(appointment.date)));
    const todayOnline = onlineAppointments.filter((appointment) => isToday(parseISO(appointment.date)));
    const pendingRequests = requests.filter((request) => request.status === 'pending');
    const unreadMessages = messages.filter((message) => message.status === 'new');
    const activeFlow = todayPhysical.filter((appointment) => waitingStatuses.has(appointment.status)).length;
    const onlineAttention = todayOnline.filter(
      (appointment) =>
        appointment.payment_status === 'pending' ||
        appointment.status === 'pre_confirmed' ||
        appointment.status === 'waiting'
    );

    const timeline: TimelineItem[] = [
      ...todayPhysical.slice(0, 8).map((appointment) => ({
        id: `physical-${appointment.id}`,
        time: appointment.time.slice(0, 5),
        channel: 'presencial' as const,
        status: appointment.status,
        title: patients.find((patient) => patient.id === appointment.patientId)?.name ?? 'Consulta presencial',
        detail: `${appointment.duration} min • ${physicalStatusLabels[appointment.status]}`,
      })),
      ...todayOnline.slice(0, 8).map((appointment) => ({
        id: `online-${appointment.id}`,
        time: appointment.time.slice(0, 5),
        channel: 'online' as const,
        status: appointment.status,
        title: 'Consulta online',
        detail: `${appointment.duration} min • ${onlineStatusLabels[appointment.status]}`,
      })),
    ].sort((a, b) => a.time.localeCompare(b.time));

    return {
      todayPhysical,
      todayOnline,
      pendingRequests,
      unreadMessages,
      activeFlow,
      onlineAttention,
      timeline,
    };
  }, [appointments, messages, onlineAppointments, patients, requests]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Command Surface"
        title="Dashboard operacional para consultas presenciais e online"
        subtitle="Visibilidade imediata sobre triage, carga do dia, operacao clinica e follow-up digital. Esta primeira vaga do upgrade ja junta o mundo presencial e a nova camada online num unico cockpit."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="secondary" className="rounded-2xl border-white/10 bg-white/10 text-white hover:bg-white/15">
              <Link to="/admin/pedidos">Abrir triage</Link>
            </Button>
            <Button asChild className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
              <Link to="/admin/agenda">Gerir agenda</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={CalendarDays}
          label="Carga total de hoje"
          value={dashboard.todayPhysical.length + dashboard.todayOnline.length}
          hint="Tudo o que exige tempo clinico hoje, presencial e por video."
          accent="cyan"
        />
        <MetricCard
          icon={Stethoscope}
          label="Consultas presenciais"
          value={dashboard.todayPhysical.length}
          hint="Agenda fisica, sala de espera e ocupacao da clinica."
          accent="emerald"
        />
        <MetricCard
          icon={Video}
          label="Consultas online"
          value={dashboard.todayOnline.length}
          hint="Videochamadas, pagamentos e confirmacoes digitais."
          accent="violet"
        />
        <MetricCard
          icon={Inbox}
          label="Pedidos pendentes"
          value={dashboard.pendingRequests.length}
          hint="Pedidos de entrada ainda por qualificar e converter."
          accent="amber"
        />
        <MetricCard
          icon={Workflow}
          label="Fluxo ativo"
          value={dashboard.activeFlow}
          hint="Pacientes hoje em espera ou em atendimento neste momento."
          accent="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <SectionCard
          title="Linha operacional de hoje"
          subtitle="Sequencia unica das interacoes do dia, misturando agenda presencial e operacao online."
          action={
            <Button asChild variant="ghost" className="rounded-2xl text-slate-600 hover:bg-slate-100">
              <Link to="/admin/agenda">
                Ver agenda completa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          {dashboard.timeline.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
              Sem operacao agendada para hoje. A proxima acao pode vir da triage ou de novas marcacoes.
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.timeline.map((item) => (
                <div key={item.id} className="flex items-start gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-4">
                  <div className="rounded-2xl bg-slate-950 px-3 py-2 font-mono text-sm text-white">
                    {item.time}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-slate-950">{item.title}</p>
                      <Badge className={`rounded-full border ${channelBadge(item.channel)}`}>
                        {item.channel === 'online' ? 'Online' : 'Presencial'}
                      </Badge>
                      <Badge className={`rounded-full border ${statusTone(item.status)}`}>
                        {item.channel === 'online'
                          ? onlineStatusLabels[item.status as OnlineAppointmentStatus]
                          : physicalStatusLabels[item.status as AppointmentStatus]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Prioridades imediatas"
          subtitle="O que tende a bloquear conversao, atendimento ou resposta ao paciente."
        >
          <div className="space-y-3">
            <Link to="/admin/pedidos" className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-700">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">Triage em aberto</p>
                    <p className="text-sm text-slate-500">Pedidos ainda por validar, responder ou converter.</p>
                  </div>
                </div>
                <span className="font-display text-2xl text-slate-950">{dashboard.pendingRequests.length}</span>
              </div>
            </Link>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-violet-400/10 p-3 text-violet-700">
                    <MonitorPlay className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">Online a precisar de acao</p>
                    <p className="text-sm text-slate-500">Pagamentos pendentes, pre-confirmacao ou sala pronta.</p>
                  </div>
                </div>
                <span className="font-display text-2xl text-slate-950">{dashboard.onlineAttention.length}</span>
              </div>
            </div>

            <Link to="/admin/mensagens" className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/60">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-700">
                    <MessageSquareMore className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">Inbox operacional</p>
                    <p className="text-sm text-slate-500">Mensagens novas com contexto comercial ou clinico.</p>
                  </div>
                </div>
                <span className="font-display text-2xl text-slate-950">{dashboard.unreadMessages.length}</span>
              </div>
            </Link>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Mix de canais"
          subtitle="Como a capacidade do dia esta distribuida entre clinica e video."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-400">Presencial</p>
              <p className="mt-3 font-display text-4xl">{dashboard.todayPhysical.length}</p>
              <p className="mt-2 text-sm text-slate-400">Consultas fisicas hoje</p>
            </div>
            <div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-500 to-blue-600 p-5 text-white">
              <p className="text-sm text-cyan-50/80">Online</p>
              <p className="mt-3 font-display text-4xl">{dashboard.todayOnline.length}</p>
              <p className="mt-2 text-sm text-cyan-50/80">Consultas por video hoje</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Base ativa"
          subtitle="Entidades centrais que a dashboard ja consegue orquestrar."
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Pacientes registados</span>
              <span className="font-display text-2xl text-slate-950">{patients.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Pedidos em fila</span>
              <span className="font-display text-2xl text-slate-950">{dashboard.pendingRequests.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Mensagens por tratar</span>
              <span className="font-display text-2xl text-slate-950">{dashboard.unreadMessages.length}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Proximo passo do upgrade"
          subtitle="O shell e o dashboard ja mudaram. A seguir, a agenda e os pedidos devem herdar a mesma logica operacional."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>1. Unificar agenda presencial e online numa grelha operacional.</p>
            <p>2. Dar estados e acao rapida ao modulo de pedidos e triage.</p>
            <p>3. Ligar melhor o portal do paciente e os fluxos de video, pagamento e documentos.</p>
          </div>
        </SectionCard>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-5 shadow-xl shadow-cyan-950/5 backdrop-blur-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400">{currentDate}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950">
              Radar operacional do dia
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Esta dashboard ja assume o novo modelo de gestao: triage separado da agenda, operacao por canal e foco em acao.
              O proximo upgrade natural e transportar esta linguagem para `Agenda`, `Pedidos` e `Fluxo Clinico`.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-2xl">
              <Link to="/admin/sala-espera">Abrir fluxo clinico</Link>
            </Button>
            <Button asChild className="rounded-2xl bg-slate-950 text-white hover:bg-slate-900">
              <Link to="/admin/pacientes">
                Ver pacientes
                <Users className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
