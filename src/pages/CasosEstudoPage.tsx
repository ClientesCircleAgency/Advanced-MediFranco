import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { PageLayout } from '@/components/layout/PageLayout';
import { CaseStudyCard } from '@/components/case-studies/CaseStudyCard';
import { CaseStudyDetailsDialog } from '@/components/case-studies/CaseStudyDetailsDialog';
import { useCaseStudies } from '@/hooks/useCaseStudies';
import type { CaseStudy } from '@/types/caseStudy';
import heroImage from '@/assets/clinical-cases/family-final-result.png';

export default function CasosEstudoPage() {
  const { caseStudies } = useCaseStudies();
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  return (
    <PageLayout
      title="Casos de Estudo | MediFranco"
      description="Exemplos editoriais de acompanhamento clinico na MediFranco, com contexto, diagnostico e seguimento explicados de forma clara."
      path="/casos-estudo"
    >
      <PageHero
        title="Casos de estudo"
        subtitle="Exemplos de acompanhamento clinico apresentados com foco no processo, na orientacao e no seguimento."
        breadcrumbItems={[
          { label: 'Inicio', href: '/' },
          { label: 'Casos de estudo' },
        ]}
        backgroundImage={heroImage}
        backgroundPosition="center 35%"
      />

      <section className="bg-background py-18 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
                Biblioteca clinica
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Casos explicados para ajudar a perceber o processo.
              </h2>
            </div>
            <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                Cada card abre uma ficha com mais contexto. A informacao e editorial e deve ser sempre
                confirmada numa consulta com a equipa clinica.
              </p>
              <div className="flex flex-wrap gap-3 text-sm font-medium text-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Diagnostico orientado
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Acompanhamento claro
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {caseStudies.map((caseStudy, index) => (
              <CaseStudyCard
                key={caseStudy.id}
                caseStudy={caseStudy}
                index={index}
                onOpen={setSelectedCase}
              />
            ))}
          </div>
        </div>
      </section>

      <CaseStudyDetailsDialog
        caseStudy={selectedCase}
        open={Boolean(selectedCase)}
        onOpenChange={(open) => {
          if (!open) setSelectedCase(null);
        }}
      />
    </PageLayout>
  );
}
