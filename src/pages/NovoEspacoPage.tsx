import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ArrowRight, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/button';
import { newSpaceServices } from '@/data/services';
import newSpaceHero from '@/assets/heroes/home-new-space-slide.png';

const organizationNotes = [
  {
    title: 'Espaco atual',
    text: 'A Medicina Dentaria continua no espaco atual da MediFranco.',
  },
  {
    title: 'Novo espaco',
    text: 'Oftalmologia e todas as novas especialidades passam para o novo espaco.',
  },
  {
    title: 'Novas areas clinicas',
    text: 'Medicina Geral, Optometria, Otorrinolaringologia, Psicologia, Pediatria, Ortoptica e Nutricao Funcional passam a fazer parte da oferta MediFranco.',
  },
];

export default function NovoEspacoPage() {
  return (
    <PageLayout
      title="Novo Espaco MediFranco | Novas Especialidades"
      description="Conheca o novo espaco MediFranco e as novas especialidades: Medicina Geral, Optometria, Otorrinolaringologia, Psicologia, Pediatria, Ortoptica e Nutricao Funcional."
      path="/novo-espaco"
      ogImage="/og/novo-espaco.jpg"
    >
      <PageHero
        title="Novo espaco MediFranco"
        subtitle="Mais especialidades, melhor organizacao clinica e acompanhamento integrado num novo espaco."
        backgroundImage={newSpaceHero}
        backgroundPosition="center center"
        breadcrumbItems={[
          { label: 'Inicio', href: '/' },
          { label: 'Novo espaco' },
        ]}
      />

      <section className="bg-background py-18 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
                <Sparkles className="h-4 w-4" />
                Novas especialidades
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                A MediFranco cresce para receber novas areas de saude.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                A clinica passa a prestar novas especialidades num novo espaco. Esta expansao
                permite organizar melhor o acompanhamento clinico e separar claramente as areas
                de funcionamento.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-xl bg-primary-gradient">
                  <Link to="/contactos">
                    Contactos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/#servicos">Ver servicos</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {organizationNotes.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 font-semibold text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    {item.title}
                  </div>
                  <p className="leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-18 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              Acompanhamento integrado
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Areas disponiveis no novo espaco.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newSpaceServices.map((service) => {
              const Icon = (Icons as any)[service.icon] || Icons.Circle;

              return (
                <article key={service.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">{service.name}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{service.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-5 rounded-3xl border border-primary/20 bg-primary-gradient p-7 text-primary-foreground shadow-lg md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-foreground/80">
                <MapPin className="h-4 w-4" />
                Informacao e contactos
              </div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Fale connosco para saber onde deve dirigir-se.
              </h2>
              <p className="mt-2 max-w-2xl text-primary-foreground/85">
                A equipa MediFranco indica-lhe o espaco adequado consoante a especialidade.
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
      </section>
    </PageLayout>
  );
}
