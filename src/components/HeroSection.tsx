import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import logo from '@/assets/logo-medifranco.png';

export function HeroSection() {
  const scrollToMarcacao = () => {
    document.querySelector('#marcacao')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSobre = () => {
    document.querySelector('#sobre')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in-up">
          {/* Logo */}
          <img
            src={logo}
            alt="MediFranco"
            className="h-24 md:h-32 lg:h-40 w-auto mx-auto mb-8 drop-shadow-lg"
          />

          {/* Main Tagline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            Cuidamos da sua{' '}
            <span className="text-primary">visão</span>
            {' '}e do seu{' '}
            <span className="text-primary">sorriso</span>
            <span className="text-primary">.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto font-normal">
            Especialistas em Oftalmologia e Medicina Dentária, com mais de 15 anos de experiência.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={scrollToMarcacao}
              className="bg-primary-gradient hover:opacity-90 text-base font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl gap-2"
            >
              <Calendar className="w-5 h-5" />
              Marcar Consulta
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToSobre}
              className="text-base font-semibold px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-xl gap-2"
            >
              Conhecer a Clínica
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-1">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
