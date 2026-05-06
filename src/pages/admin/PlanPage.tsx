import { ArrowRight, Check, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { cn } from '@/lib/utils';

const planFeatures = {
  advanced: [
    'Até 500 pacientes',
    'Agenda avançada',
    'Sala de espera digital',
    'Relatórios básicos',
    'Suporte por email',
  ],
  premium: [
    'Pacientes ilimitados',
    'Agenda avançada com IA',
    'Sala de espera digital',
    'Relatórios avançados e analytics',
    'Integrações com laboratórios',
    'API completa',
    'Suporte prioritário 24/7',
    'Onboarding personalizado',
  ],
};

const shellCardClassName =
  'rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-cyan-950/5 backdrop-blur-sm';

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Growth Layer"
        title="Plano"
        subtitle="Comparação simples e elegante entre o plano atual e a próxima camada de capacidades."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <div className={cn(shellCardClassName, 'relative overflow-hidden p-6 lg:p-8')}>
          <div className="absolute left-0 right-0 top-0 h-1 bg-cyan-500" />
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Plano atual</p>
              <h3 className="font-display text-2xl font-semibold text-slate-950">Advanced</h3>
            </div>
          </div>

          <div className="space-y-3">
            {planFeatures.advanced.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                  <Check className="h-3.5 w-3.5 text-slate-600" />
                </div>
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" className="mt-6 w-full rounded-2xl border-slate-200 bg-slate-50" disabled>
            Plano atual
          </Button>
        </div>

        <div className={cn(shellCardClassName, 'relative overflow-hidden border-cyan-200 p-6 lg:p-8')}>
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-violet-500" />
          <div className="absolute right-6 top-0 rounded-b-xl bg-slate-950 px-3 py-1 text-xs font-medium text-white">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Recomendado
            </span>
          </div>

          <div className="mb-6 mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Upgrade para</p>
              <h3 className="font-display text-2xl font-semibold text-slate-950">Premium</h3>
            </div>
          </div>

          <div className="space-y-3">
            {planFeatures.premium.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-[1.25rem] border border-cyan-100 bg-cyan-50/50 px-4 py-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                  <Check className="h-3.5 w-3.5 text-cyan-700" />
                </div>
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>

          <Button className="mt-6 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-900">
            Fazer upgrade
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="mt-4 text-center text-xs text-slate-500">Sem compromisso. Cancele quando quiser.</p>
        </div>
      </div>
    </div>
  );
}
