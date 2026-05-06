import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHero } from '@/components/layout/PageHero';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import {
  GraduationCap,
  BookOpen,
  Video,
  Award,
  Users,
  ArrowRight,
  ExternalLink,
  PlayCircle,
} from 'lucide-react';

const ACADEMY_URL = import.meta.env.VITE_ACADEMY_URL || 'https://academy.medifranco.pt';

// ─── O que é a Academy ───────────────────────────────────────────────────────

const features = [
  {
    icon: BookOpen,
    title: 'Formação Contínua',
    description: 'Cursos desenvolvidos por especialistas MediFranco, actualizados com as mais recentes evidências científicas.',
  },
  {
    icon: PlayCircle,
    title: 'Aprenda ao Seu Ritmo',
    description: 'Aceda às aulas em vídeo quando quiser. Não há horários fixos — estude onde e quando for mais conveniente.',
  },
  {
    icon: Award,
    title: 'Certificação Digital',
    description: 'Ao concluir cada curso, recebe um certificado digital que pode partilhar e incluir no seu currículo.',
  },
  {
    icon: Users,
    title: 'Para Profissionais Externos',
    description: 'A Academy está aberta a todos os profissionais de saúde — não precisa de ser colaborador da MediFranco.',
  },
];

function FeaturesSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-accent/20">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              O que encontra na <span className="text-primary-gradient">Academy</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Uma plataforma de e-learning pensada para profissionais de saúde que querem crescer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 transition-all duration-700 delay-${index * 100} ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-base">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Áreas de Formação ───────────────────────────────────────────────────────

const areas = [
  { label: 'Oftalmologia', emoji: '👁️' },
  { label: 'Medicina Dentária', emoji: '🦷' },
  { label: 'Medicina Geral', emoji: '🩺' },
  { label: 'Gestão Clínica', emoji: '📋' },
  { label: 'Urgência e Emergência', emoji: '🏥' },
  { label: 'Comunicação com Pacientes', emoji: '🗣️' },
];

function AreasSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Áreas de <span className="text-primary-gradient">Formação</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {areas.map((area) => (
              <div
                key={area.label}
                className="flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-default"
              >
                <span>{area.emoji}</span>
                {area.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ───────────────────────────────────────────────────────────────

function CTASection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-accent/20">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="max-w-3xl mx-auto text-center bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Pronto para <span className="text-primary-gradient">aprender</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Explore o catálogo de cursos, inscreva-se e comece a aprender hoje mesmo.
              Formação de qualidade, acessível a todos os profissionais de saúde.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={ACADEMY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-semibold hover:bg-primary/90 transition-colors"
              >
                Explorar Cursos
                <ExternalLink className="w-5 h-5" />
              </a>
              <Link
                to="/contactos"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
              >
                Falar connosco
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AcademyPage() {
  return (
    <PageLayout
      title="MediFranco Academy — Formação Online para Profissionais de Saúde"
      description="Cursos de formação contínua para profissionais de saúde. Aprenda ao seu ritmo com aulas em vídeo, certificação digital e acesso vitalício."
      path="/academy"
    >
      <PageHero
        title="MediFranco Academy"
        subtitle="Formação contínua online para profissionais de saúde."
        breadcrumbItems={[
          { label: 'Início', href: '/' },
          { label: 'Academy' },
        ]}
      />

      <FeaturesSection />
      <AreasSection />
      <CTASection />
    </PageLayout>
  );
}
