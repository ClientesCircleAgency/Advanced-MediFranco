import { RevenueChart } from '@/components/admin/RevenueChart';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h1 className="font-serif text-xl lg:text-2xl text-foreground">
          Faturação
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          Acompanhe a faturação estimada da clínica
        </p>
      </div>

      {/* Revenue Chart */}
      <RevenueChart />
    </div>
  );
}