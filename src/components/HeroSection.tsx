import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo-medifranco.png';
import homeHero from '@/assets/heroes/home-hero.jpg';
import visualScreeningSlide from '@/assets/heroes/home-visual-screening-slide.png';
import newSpaceSlide from '@/assets/heroes/home-new-space-slide.png';
import { cn } from '@/lib/utils';

const specialties = [
  'Medicina Geral',
  'Optometria',
  'Otorrinolaringologia',
  'Psicologia',
  'Pediatria',
  'Ortóptica',
  'Nutrição Funcional',
];

const slides = [
  {
    id: 'main',
    image: homeHero,
    imagePosition: 'center center',
    tone: 'clinic',
  },
  {
    id: 'visual-screening',
    image: visualScreeningSlide,
    imagePosition: 'center center',
    tone: 'campaign',
  },
  {
    id: 'new-space',
    image: newSpaceSlide,
    imagePosition: 'center center',
    tone: 'campaign',
  },
] as const;

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setActiveSlide(index);

  const goToPrevious = () => {
    setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  const scrollToSobre = () => {
    document.querySelector('#sobre')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <section id="hero" className="relative flex min-h-screen items-center overflow-hidden bg-background">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-700',
            index === activeSlide ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundPosition: slide.imagePosition,
          }}
        >
          {slide.tone === 'clinic' ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(20,184,166,0.22),transparent_32%),linear-gradient(90deg,rgba(248,255,255,0.96)_0%,rgba(248,255,255,0.84)_35%,rgba(248,255,255,0.44)_62%,rgba(248,255,255,0.12)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/58 to-white/5 md:from-white/25 md:via-white/5 md:to-transparent" />
          )}
        </div>
      ))}

      <div className="relative z-10 container mx-auto px-4 pb-20 pt-28">
        <div
          className={cn(
            'transition-all duration-700',
            activeSlide === 0 ? 'max-w-3xl' : 'max-w-2xl'
          )}
        >
          {activeSlide === 0 && (
            <div className="animate-fade-in-up">
              <img
                alt="MediFranco"
                className="mb-8 h-24 w-auto max-w-[88vw] drop-shadow-lg md:h-32 lg:h-40"
                src={logo}
              />

              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Cuidamos da sua <span className="text-primary-gradient">visão</span> e do seu{' '}
                <span className="text-primary-gradient">sorriso</span>
                <span className="text-primary-gradient">.</span>
              </h1>

              <p className="mb-10 mt-6 max-w-xl text-lg font-normal text-muted-foreground md:text-xl">
                Especialistas em Oftalmologia e Medicina Dentária, com mais de 15 anos de experiência.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="gap-2 rounded-xl bg-primary-gradient px-8 py-6 text-base font-semibold shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl"
                  asChild
                >
                  <Link to="/marcar-consulta">
                    <Calendar className="h-5 w-5" />
                    Marcar Consulta
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToSobre}
                  className="gap-2 rounded-xl border-2 border-primary px-8 py-6 text-base font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                >
                  Conhecer a Clínica
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {activeSlide === 1 && (
            <div className="animate-fade-in-up">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                Oferta especial de lançamento
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl lg:text-6xl">
                Receba um rastreio visual gratuito
              </h1>
              <div className="mt-7 max-w-xl rounded-2xl border border-primary/20 bg-white/72 p-5 shadow-xl backdrop-blur-md md:p-6">
                <p className="text-lg font-semibold leading-relaxed text-foreground md:text-xl">
                  Com a Optometrista Cláudia Patrício, na MediFranco.
                </p>
                <p className="mt-3 text-muted-foreground">
                  Marque através do telefone ou envie o pedido online.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="rounded-xl bg-primary-gradient">
                    <Link to="/marcar-consulta">
                      <Calendar className="mr-2 h-4 w-4" />
                      Marcar rastreio
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl border-primary/30 bg-white/70 text-primary">
                    <a href="tel:+351265540990">
                      <Phone className="mr-2 h-4 w-4" />
                      265 540 990
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSlide === 2 && (
            <div className="animate-fade-in-up">
              <div className="max-w-xl rounded-[2rem] border border-primary/20 bg-white/76 p-6 shadow-2xl backdrop-blur-md md:p-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" />
                  Novo espaço MediFranco
                </div>
                <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
                  Novas especialidades num novo espaço
                </h1>
                <p className="mt-5 text-base font-semibold text-foreground md:text-lg">
                  Acompanhamento integrado em:
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                  No espaço atual ficará a Medicina Dentária. As restantes áreas passam para o novo espaço.
                </p>
                <Button asChild className="mt-5 rounded-xl bg-primary-gradient">
                  <Link to="/marcar-consulta">
                    Marcar consulta
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        <button
          type="button"
          onClick={goToPrevious}
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white/75 text-primary shadow-sm backdrop-blur transition hover:bg-white md:flex"
          aria-label="Hero anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-3 py-2 shadow-sm backdrop-blur">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2.5 rounded-full transition-all',
                activeSlide === index ? 'w-8 bg-primary' : 'w-2.5 bg-primary/25 hover:bg-primary/45'
              )}
              aria-label={`Ver slide ${index + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goToNext}
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white/75 text-primary shadow-sm backdrop-blur transition hover:bg-white md:flex"
          aria-label="Próximo hero"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
