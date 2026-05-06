import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Documentos</h1>
        <p className="text-muted-foreground mt-1">Receitas, relatórios e exames.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-medium text-foreground mb-1">Sem documentos</h3>
        <p className="text-sm text-muted-foreground">
          Os documentos partilhados pela clínica aparecerão aqui.
        </p>
      </div>
    </div>
  );
}
