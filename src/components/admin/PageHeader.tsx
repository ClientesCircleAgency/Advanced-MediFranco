import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow = 'MediFranco Operations',
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 px-5 py-5 text-white shadow-2xl lg:px-8 lg:py-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_70%_120%,rgba(20,184,166,0.20),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(12,18,34,0.92))]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-200/75">
            {eyebrow}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white lg:text-4xl">{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 lg:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
