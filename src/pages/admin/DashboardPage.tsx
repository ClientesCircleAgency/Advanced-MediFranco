import { CalendarDays, Euro, Star, RefreshCw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClinic } from '@/context/ClinicContext';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { appointments, patients } = useClinic();
  
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter((a) => a.date === todayDate);
  
  // Estatísticas mock para demonstração
  const stats = {
    consultasHoje: todayAppointments.length || 24,
    faturacaoDia: 850.00,
    avaliacaoGoogle: 4.9,
    reviewsCount: 120,
    pacientesRecall: 8,
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Consultas Hoje */}
        <Card className="p-4 lg:p-5 bg-card border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-muted flex items-center justify-center">
              <CalendarDays className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
            </div>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs">
              +12%
            </Badge>
          </div>
          <div className="mt-3 lg:mt-4">
            <p className="text-2xl lg:text-3xl font-bold text-foreground">{stats.consultasHoje}</p>
            <p className="text-xs lg:text-sm text-muted-foreground">Consultas Hoje</p>
          </div>
        </Card>

        {/* Faturação */}
        <Card className="p-4 lg:p-5 bg-card border-primary/30 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Euro className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
            </div>
            <Badge variant="outline" className="text-muted-foreground border-muted text-xs">
              Estimado
            </Badge>
          </div>
          <div className="mt-3 lg:mt-4">
            <p className="text-2xl lg:text-3xl font-bold text-foreground">€ {stats.faturacaoDia.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs lg:text-sm text-muted-foreground">Faturação do Dia</p>
          </div>
        </Card>

        {/* Avaliação Google */}
        <Card className="p-4 lg:p-5 bg-card border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Star className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500" />
            </div>
            <Badge variant="outline" className="text-muted-foreground border-muted text-xs">
              Google
            </Badge>
          </div>
          <div className="mt-3 lg:mt-4">
            <p className="text-2xl lg:text-3xl font-bold text-foreground">{stats.avaliacaoGoogle}</p>
            <p className="text-xs lg:text-sm text-muted-foreground">Avaliação ({stats.reviewsCount} reviews)</p>
          </div>
        </Card>

        {/* Pacientes Recall */}
        <Card className="p-4 lg:p-5 bg-card border-border hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
            </div>
            <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5 text-xs">
              Ação
            </Badge>
          </div>
          <div className="mt-3 lg:mt-4">
            <p className="text-2xl lg:text-3xl font-bold text-foreground">{stats.pacientesRecall}</p>
            <p className="text-xs lg:text-sm text-muted-foreground">Pacientes Recall (6 meses)</p>
          </div>
        </Card>
      </div>

      {/* Automação de Retorno */}
      <Card className="p-4 lg:p-5 bg-card border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 lg:gap-4 flex-1">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Send className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm lg:text-base">Automação de Retorno</h3>
              <p className="text-xs lg:text-sm text-muted-foreground">
                Existem {stats.pacientesRecall} pacientes que não visitam a clínica há 6 meses.
              </p>
            </div>
          </div>
          <Button className="gap-2 shrink-0 w-full sm:w-auto">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Enviar</span> {stats.pacientesRecall} Convites
          </Button>
        </div>
      </Card>

      {/* Grid de cards inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Próximas Consultas */}
        <Card className="p-4 lg:p-5 bg-card border-border">
          <h3 className="font-semibold text-foreground text-sm lg:text-base mb-3 lg:mb-4">Próximas Consultas</h3>
          <div className="space-y-2 lg:space-y-3">
            {todayAppointments.slice(0, 5).map((apt, index) => (
              <div key={apt.id} className="flex items-center gap-3 p-2.5 lg:p-3 rounded-lg bg-muted/30">
                <div className="text-base lg:text-lg font-mono font-medium text-foreground w-12 lg:w-14">
                  {apt.time}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-xs lg:text-sm truncate">Paciente #{index + 1}</p>
                  <p className="text-xs text-muted-foreground truncate">Consulta agendada</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {apt.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
                </Badge>
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <p className="text-muted-foreground text-xs lg:text-sm text-center py-6 lg:py-8">
                Nenhuma consulta agendada para hoje
              </p>
            )}
          </div>
        </Card>

        {/* Atividade Recente */}
        <Card className="p-4 lg:p-5 bg-card border-border">
          <h3 className="font-semibold text-foreground text-sm lg:text-base mb-3 lg:mb-4">Atividade Recente</h3>
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center gap-3 p-2.5 lg:p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm text-foreground truncate">Nova marcação confirmada via WhatsApp</p>
                <p className="text-xs text-muted-foreground">há 5 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 lg:p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm text-foreground truncate">Paciente chegou para consulta</p>
                <p className="text-xs text-muted-foreground">há 12 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 lg:p-3 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm text-foreground truncate">Lembrete automático enviado</p>
                <p className="text-xs text-muted-foreground">há 30 minutos</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
