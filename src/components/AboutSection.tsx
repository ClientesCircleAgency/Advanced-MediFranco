import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Users, Calendar, Award, Stethoscope, HeartPulse, Telescope, HandHeart } from 'lucide-react';
import fundadoresImg from '@/assets/fundadores.png';

const stats = [
  { number: '15+', label: 'Anos de Experiência', icon: Award },
  { number: '10.000+', label: 'Pacientes Satisfeitos', icon: Users },
  { number: '3', label: 'Especialistas', icon: Stethoscope },
  { number: '12', label: 'Serviços', icon: Calendar },
];

const principles = [
  {
    title: 'Missão',
    description:
      'Cuidar da saúde visual e oral de cada paciente com rigor clínico, proximidade humana e planos de tratamento claros.',
    icon: HeartPulse,
  },
  {
    title: 'Visão',
    description:
      'Ser uma clínica de referência em Setúbal, unindo oftalmologia e medicina dentária num acompanhamento moderno e integrado.',
    icon: Telescope,
  },
  {
    title: 'Valores',
    description:
      'Confiança, transparência, excelência clínica e respeito pelo tempo, pelas dúvidas e pela história de cada paciente.',
    icon: HandHeart,
  },
];

export function AboutSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="sobre" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-4">
              <span className="text-sm font-medium text-accent-foreground">Sobre Nós</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Conheça a <span className="text-primary-gradient">MediFranco</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Há mais de 15 anos a cuidar da sua saúde oral e visual, com uma equipa
              de profissionais dedicados e tecnologia de ponta.
            </p>
          </div>

          {/* Founders Section */}
          <div className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Founders Image */}
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-border">
                  <img
                    src={fundadoresImg}
                    alt="Os Fundadores da MediFranco"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -top-6 -left-6 w-40 h-40 bg-accent/50 rounded-full blur-3xl" />
              </div>

              {/* Founders Story */}
              <div className="space-y-6">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  A Nossa <span className="text-primary-gradient">História</span>
                </h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Crescemos a ver o nosso pai, <strong className="text-foreground">Dr. António Franco</strong>, 
                    a exercer uma medicina diferente. Uma medicina de carinho genuíno, onde a conquista 
                    da confiança dos doentes se traduzia em actos de verdadeiro reconhecimento.
                  </p>
                  <p>
                    Essa forma de estar na medicina ficou-nos marcada na memória, inspirando a criação 
                    da <strong className="text-foreground">MediFranco</strong> — uma clínica onde cada paciente 
                    é tratado com o mesmo cuidado e dedicação que o nosso pai sempre demonstrou.
                  </p>
                  <p>
                    Hoje, continuamos esse legado, combinando a tradição de excelência com as mais 
                    modernas tecnologias em oftalmologia e medicina dentária.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <div className="mb-10 max-w-3xl">
              <span className="text-sm font-semibold uppercase text-primary">O que nos orienta</span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl">
                Missão, visão e valores que tornam o cuidado mais humano.
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {principles.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="mb-3 font-display text-2xl font-bold tracking-tight text-foreground">
                      {item.title}
                    </h4>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/30 transition-all duration-300"
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
