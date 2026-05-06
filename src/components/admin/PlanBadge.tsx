import { Crown, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type PlanType = 'basic' | 'advanced' | 'premium';

interface PlanBadgeProps {
  plan: PlanType;
  collapsed?: boolean;
}

const planConfig: Record<
  PlanType,
  { label: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string }
> = {
  basic: {
    label: 'Basic',
    icon: Star,
    color: 'text-slate-300',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10',
  },
  advanced: {
    label: 'Advanced',
    icon: Zap,
    color: 'text-cyan-200',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/20',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    color: 'text-violet-200',
    bgColor: 'bg-violet-400/10',
    borderColor: 'border-violet-400/20',
  },
};

export function PlanBadge({ plan, collapsed = false }: PlanBadgeProps) {
  const config = planConfig[plan];
  const Icon = config.icon;

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/admin/plano"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl border transition-all hover:scale-105',
              config.bgColor,
              config.borderColor,
              config.color
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Plano {config.label}</p>
          <p className="text-xs text-muted-foreground">Clique para ver opcoes</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      to="/admin/plano"
      className={cn(
        'flex items-center gap-3 rounded-[1.5rem] border px-3 py-3 transition-all hover:border-cyan-400/25 hover:bg-white/7',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950/40', config.color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">Plano atual</p>
        <p className={cn('text-sm font-semibold', config.color)}>{config.label}</p>
      </div>
    </Link>
  );
}
