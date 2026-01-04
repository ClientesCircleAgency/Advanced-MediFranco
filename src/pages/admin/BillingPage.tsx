import { RevenueChart } from '@/components/admin/RevenueChart';
import { AppointmentsChart } from '@/components/admin/AppointmentsChart';
import { PageHeader } from '@/components/admin/PageHeader';

export default function BillingPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader 
        title="Faturação" 
        subtitle="Acompanhe a faturação estimada da clínica" 
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <RevenueChart />
        <AppointmentsChart />
      </div>
    </div>
  );
}