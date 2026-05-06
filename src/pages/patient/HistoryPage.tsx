import { Clock } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Histórico</h1>
        <p className="text-muted-foreground mt-1">Consultas anteriores.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-medium text-foreground mb-1">Sem histórico</h3>
        <p className="text-sm text-muted-foreground">
          O histórico das suas consultas aparecerá aqui após a primeira consulta.
        </p>
      </div>
    </div>
  );
}
