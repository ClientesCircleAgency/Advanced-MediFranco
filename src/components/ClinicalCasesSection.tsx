import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CaseStudyCard } from '@/components/case-studies/CaseStudyCard';
import { CaseStudyDetailsDialog } from '@/components/case-studies/CaseStudyDetailsDialog';
import { useCaseStudies } from '@/hooks/useCaseStudies';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { CaseStudy } from '@/types/caseStudy';

export function ClinicalCasesSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { caseStudies } = useCaseStudies();
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const featuredCases = caseStudies.filter((item) => item.featured !== false).slice(0, 3);

  return (
    <section id="casos-clinicos" className="bg-card py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="mb-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
                Casos clinicos
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                <span className="text-primary-gradient">Resultados</span> explicados com{' '}
                <span className="text-primary-gradient">clareza</span>, sem{' '}
                <span className="text-primary-gradient">promessas vazias</span>.
              </h2>
            </div>
            <div className="space-y-5 lg:pl-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Em saude, confianca vem de perceber o processo. Estes exemplos mostram como a MediFranco
                organiza diagnostico, tratamento e acompanhamento para cada caso.
              </p>
              <div className="flex flex-wrap gap-3 text-sm font-medium text-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Diagnostico antes da decisao
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Seguimento pos-consulta
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredCases.map((item, index) => (
              <CaseStudyCard
                key={item.id}
                caseStudy={item}
                index={index}
                isVisible={isVisible}
                onOpen={setSelectedCase}
              />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/casos-estudo">
                Ver todos os casos de estudo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div
            id="marcacao"
            className="mt-10 flex scroll-mt-28 flex-col items-start justify-between gap-4 rounded-2xl bg-primary-gradient p-6 text-primary-foreground shadow-lg md:flex-row md:items-center"
          >
            <div>
              <h3 className="font-display text-2xl font-bold tracking-tight">Quer perceber qual e o melhor plano para si?</h3>
              <p className="mt-2 text-primary-foreground/85">
                A primeira consulta ajuda a transformar duvidas soltas num plano clinico claro.
              </p>
            </div>
            <Button asChild variant="secondary" className="rounded-xl bg-white text-primary hover:bg-white/90">
              <Link to="/contactos">
                Ver contactos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <CaseStudyDetailsDialog
        caseStudy={selectedCase}
        open={Boolean(selectedCase)}
        onOpenChange={(open) => {
          if (!open) setSelectedCase(null);
        }}
      />
    </section>
  );
}
