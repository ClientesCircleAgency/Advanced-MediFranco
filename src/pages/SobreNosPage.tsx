import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHero } from '@/components/layout/PageHero';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import {
  Heart,
  Eye,
  Users,
  Award,
  Stethoscope,
  Calendar,
  Shield,
  Lightbulb,
  HandHeart,
  ArrowRight,
} from 'lucide-react';
import fundadoresImg from '@/assets/fundadores.png';
import sobreNosHero from '@/assets/heroes/sobre-nos-hero.jpg';

const missionVisionValues = [
  {
    title: 'Missao',
    heading: 'Missao',
    icon: Heart,
    content:
      'Proporcionar melhor saude atraves de medicina baseada em valores humanos, conhecimento cientifico, consciencia etica e responsabilidade social.',
  },
  {
    title: 'Visao',
    heading: 'Visao',
    icon: Eye,
    content:
      'Ser clinica de referencia no distrito de Setubal em servicos de diagnostico especializado e interdisciplinar em oftalmologia, medicina dentaria e reabilitacao oral.',
  },
  {
    title: 'Valores',
    heading: 'Valores',
    icon: Shield,
    content: 'Humanismo, Etica, Interdisciplinaridade e Prevencao sao os pilares que guiam cada decisao clinica e cada interacao com os nossos pacientes.',
  },
];

const pilares = [
  {
    icon: Stethoscope,
    title: 'Medicina',
    description:
      'Actos medicos requerem consideracao etica, compaixao e sensibilidade individual as ansiedades e expectativas dos pacientes. Cada consulta e um acto de cuidado genuino.',
  },
  {
    icon: Lightbulb,
    title: 'Prevencao',
    description:
      'Foco na prevencao de doencas atraves da consciencia de saude e modificacao do estilo de vida. Acreditamos que a melhor medicina e aquela que antecipa.',
  },
  {
    icon: HandHeart,
    title: 'Equipa',
    description:
      'Colaboracao interdisciplinar diaria desde a recepcao ate aos cuidados clinicos. Uma equipa unida que trabalha em conjunto pelo bem-estar de cada paciente.',
  },
];

const stats = [
  { number: '25+', label: 'Anos de Experiencia', icon: Award },
  { number: '10.000+', label: 'Pacientes Atendidos', icon: Users },
  { number: '10', label: 'Profissionais', icon: Stethoscope },
  { number: '2', label: 'Especialidades', icon: Calendar },
];

function HistorySection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-border">
                <img
                  src={fundadoresImg}
                  alt="Fundadores da clinica MediFranco em Setubal"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -top-6 -left-6 w-40 h-40 bg-accent/50 rounded-full blur-3xl" />
            </div>

            <div className="space-y-6">
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                A Nossa <span className="text-primary-gradient">Historia</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Fundada em 2000 pelo{' '}
                  <strong className="text-foreground">Dr. Antonio Franco</strong>, a
                  MediFranco nasceu de uma visao de medicina enraizada em valores humanos.
                  Uma medicina de carinho genuino, onde a conquista da confianca dos doentes
                  se traduz em actos de verdadeiro reconhecimento.
                </p>
                <p>
                  Crescemos a ver o nosso pai a exercer uma medicina diferente — com tempo,
                  atencao e cuidado genuino por cada paciente. Essa forma de estar ficou-nos
                  marcada na memoria e inspirou a criacao desta clinica.
                </p>
                <p>
                  Hoje, ha mais de 25 anos, continuamos esse legado em Setubal, combinando a
                  tradicao de excelencia com as mais modernas tecnologias em{' '}
                  <Link to="/oftalmologia" className="text-primary hover:underline font-medium">
                    oftalmologia
                  </Link>{' '}
                  e{' '}
                  <Link to="/medicina-dentaria" className="text-primary hover:underline font-medium">
                    medicina dentaria
                  </Link>
                  . Cada paciente e tratado com o mesmo cuidado e dedicacao que o nosso
                  fundador sempre demonstrou.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionVisionSection() {
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
              Missao, Visao e <span className="text-primary-gradient">Valores</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {missionVisionValues.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`bg-card border border-border rounded-2xl p-6 md:p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-500 ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {item.heading}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{item.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PilaresSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Os Nossos <span className="text-primary-gradient">Pilares</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mt-4">
              Tres principios fundamentais que orientam a nossa pratica clinica diaria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {pilares.map((pilar, index) => {
              const Icon = pilar.icon;
              return (
                <div
                  key={pilar.title}
                  className={`relative bg-card border border-border rounded-2xl p-6 md:p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-500 group ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="absolute top-4 right-4 font-display text-6xl font-bold text-accent/50 select-none">
                    {index + 1}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {pilar.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{pilar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
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
              MediFranco em <span className="text-primary-gradient">Numeros</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="max-w-3xl mx-auto text-center bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Conheca a nossa <span className="text-primary-gradient">equipa</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Profissionais dedicados, com experiencia e paixao pela medicina humanizada.
            </p>
            <Link
              to="/equipa"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Conhecer a Equipa
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SobreNosPage() {
  return (
    <PageLayout
      title="Sobre a MediFranco — 25+ Anos de Medicina em Setubal"
      description="Fundada em 2000 pelo Dr. Antonio Franco. Conheca a historia, missao e valores da clinica de referencia em Setubal."
      path="/sobre-nos"
      ogImage="/og/sobre-nos.jpg"
    >
      <PageHero
        title="Sobre a MediFranco"
        subtitle="Ha mais de 25 anos a cuidar da sua saude em Setubal."
        backgroundImage={sobreNosHero}
        backgroundPosition="center 48%"
        breadcrumbItems={[
          { label: 'Inicio', href: '/' },
          { label: 'Sobre Nos' },
        ]}
      />

      <HistorySection />
      <MissionVisionSection />
      <PilaresSection />
      <StatsSection />
      <CTASection />
    </PageLayout>
  );
}
