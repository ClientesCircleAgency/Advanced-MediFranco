import { CheckCircle2, Eye, ShieldCheck, Smile } from 'lucide-react';
import type { CaseStudy } from '@/types/caseStudy';

const iconMap = {
  smile: Smile,
  eye: Eye,
  shield: ShieldCheck,
};

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  index?: number;
  isVisible?: boolean;
  onOpen: (caseStudy: CaseStudy) => void;
}

export function CaseStudyCard({ caseStudy, index = 0, isVisible = true, onOpen }: CaseStudyCardProps) {
  const Icon = iconMap[caseStudy.icon] ?? Smile;

  return (
    <button
      type="button"
      onClick={() => onOpen(caseStudy)}
      className={`group flex min-h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-background text-left shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="relative h-52 bg-muted">
        <img
          src={caseStudy.image}
          alt={caseStudy.imageAlt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-foreground/15 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-card/90 px-3 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur">
            {caseStudy.specialty}
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-card/90 text-primary shadow-sm backdrop-blur">
            <Icon className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-primary">
          <CheckCircle2 className="h-4 w-4" />
          Caso orientado por diagnostico
        </div>

        <h3 className="mb-3 font-display text-2xl font-bold tracking-tight text-foreground">
          {caseStudy.title}
        </h3>
        <p className="mb-6 leading-relaxed text-muted-foreground">{caseStudy.summary}</p>

        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="mb-2 font-display text-3xl font-bold text-primary">{caseStudy.metric}</div>
          <p className="text-sm text-muted-foreground">{caseStudy.metricLabel}</p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Antes</p>
            <p className="text-sm font-semibold text-foreground">{caseStudy.before}</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-primary">Depois</p>
            <p className="text-sm font-semibold text-foreground">{caseStudy.after}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
