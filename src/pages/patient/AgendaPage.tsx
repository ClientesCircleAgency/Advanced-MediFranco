import { Calendar } from 'lucide-react';

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Agenda</h1>
        <p className="text-muted-foreground mt-1">As suas próximas consultas.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-medium text-foreground mb-1">Sem consultas agendadas</h3>
        <p className="text-sm text-muted-foreground">
          Quando marcar uma consulta, ela aparecerá aqui.
        </p>
      </div>
    </div>
  );
}
