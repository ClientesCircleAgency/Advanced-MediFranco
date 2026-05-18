import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, ShieldCheck, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import dentalFinalResultImg from '@/assets/clinical-cases/dental-final-result.png';
import ophthalmologyFinalResultImg from '@/assets/clinical-cases/ophthalmology-final-result.png';
import familyFinalResultImg from '@/assets/clinical-cases/family-final-result.png';

const cases = [
  {
    specialty: 'Medicina Dentária',
    title: 'Reabilitação estética e funcional',
    summary:
      'Plano combinado para devolver segurança ao sorriso, com foco em função mastigatória, proporção e naturalidade.',
    icon: Smile,
    metric: '3 fases',
    metricLabel: 'Diagnóstico, tratamento e revisão',
    before: 'Desconforto ao sorrir',
    after: 'Sorriso mais estável',
    image: dentalFinalResultImg,
    imageAlt: 'Planeamento de caso clínico de medicina dentária',
  },
  {
    specialty: 'Oftalmologia',
    title: 'Acompanhamento de cataratas',
    summary:
      'Avaliação clínica, exames complementares e orientação clara para uma decisão médica mais tranquila.',
    icon: Eye,
    metric: '360º',
    metricLabel: 'Avaliação visual completa',
    before: 'Visão turva',
    after: 'Plano de tratamento claro',
    image: ophthalmologyFinalResultImg,
    imageAlt: 'Avaliação oftalmológica para cataratas',
  },
  {
    specialty: 'Saúde integrada',
    title: 'Prevenção em família',
    summary:
      'Consultas coordenadas para diferentes idades, reduzindo atrasos no diagnóstico e simplificando o seguimento.',
    icon: ShieldCheck,
    metric: '1 equipa',
    metricLabel: 'Duas áreas clínicas no mesmo espaço',
    before: 'Consultas dispersas',
    after: 'Seguimento centralizado',
    image: familyFinalResultImg,
    imageAlt: 'Consulta clínica integrada na MediFranco',
  },
];

export function ClinicalCasesSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

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
                Casos clínicos
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                <span className="text-primary-gradient">Resultados</span> explicados com{' '}
                <span className="text-primary-gradient">clareza</span>, sem{' '}
                <span className="text-primary-gradient">promessas vazias</span>.
              </h2>
            </div>
            <div className="space-y-5 lg:pl-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Em saúde, confiança vem de perceber o processo. Estes exemplos mostram como a MediFranco
                organiza diagnóstico, tratamento e acompanhamento para cada caso.
              </p>
              <div className="flex flex-wrap gap-3 text-sm font-medium text-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Diagnóstico antes da decisão
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Seguimento pós-consulta
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {cases.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className={`group flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="relative h-52 bg-muted">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-foreground/15 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-card/90 px-3 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur">
                        {item.specialty}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-card/90 text-primary shadow-sm backdrop-blur">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      Caso orientado por diagnóstico
                    </div>

                    <h3 className="mb-3 font-display text-2xl font-bold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-6 leading-relaxed text-muted-foreground">{item.summary}</p>

                    <div className="mb-6 rounded-xl border border-border bg-card p-4">
                      <div className="mb-2 font-display text-3xl font-bold text-primary">{item.metric}</div>
                      <p className="text-sm text-muted-foreground">{item.metricLabel}</p>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-muted p-4">
                        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Antes</p>
                        <p className="text-sm font-semibold text-foreground">{item.before}</p>
                      </div>
                      <div className="rounded-xl bg-primary/10 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase text-primary">Depois</p>
                        <p className="text-sm font-semibold text-foreground">{item.after}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div
            id="marcacao"
            className="mt-10 flex scroll-mt-28 flex-col items-start justify-between gap-4 rounded-2xl bg-primary-gradient p-6 text-primary-foreground shadow-lg md:flex-row md:items-center"
          >
            <div>
              <h3 className="font-display text-2xl font-bold tracking-tight">Quer perceber qual é o melhor plano para si?</h3>
              <p className="mt-2 text-primary-foreground/85">
                A primeira consulta ajuda a transformar dúvidas soltas num plano clínico claro.
              </p>
            </div>
            <Button asChild variant="secondary" className="rounded-xl bg-white text-primary hover:bg-white/90">
              <Link to="/marcar-consulta">
                Marcar avaliação
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
