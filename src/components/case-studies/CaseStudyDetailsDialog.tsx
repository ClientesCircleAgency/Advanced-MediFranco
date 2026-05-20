import { CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CaseStudy } from '@/types/caseStudy';

interface CaseStudyDetailsDialogProps {
  caseStudy: CaseStudy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CaseStudyDetailsDialog({ caseStudy, open, onOpenChange }: CaseStudyDetailsDialogProps) {
  if (!caseStudy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-3xl">
        <div className="relative h-64 overflow-hidden rounded-t-3xl bg-muted">
          <img src={caseStudy.image} alt={caseStudy.imageAlt} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <span className="mb-3 inline-flex rounded-full bg-card/90 px-3 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur">
              {caseStudy.specialty}
            </span>
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-3xl text-white">{caseStudy.title}</DialogTitle>
              <DialogDescription className="text-white/80">{caseStudy.summary}</DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {caseStudy.detailTitle}
            </div>
            <p className="leading-relaxed text-muted-foreground">{caseStudy.detail}</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-4xl font-bold text-primary">{caseStudy.metric}</p>
              <p className="mt-2 text-sm text-muted-foreground">{caseStudy.metricLabel}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Antes</p>
                <p className="text-sm font-semibold text-foreground">{caseStudy.before}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-primary">Depois</p>
                <p className="text-sm font-semibold text-foreground">{caseStudy.after}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
