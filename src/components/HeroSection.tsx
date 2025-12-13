import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          {/* Logo */}
          <img
            src={logo}
            alt="MediFranco"
            className="h-24 md:h-32 lg:h-40 w-auto mx-auto mb-8"
          />

          {/* Tagline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            O seu{' '}
            <span className="text-primary">Sorriso</span>
            {' '}e a sua{' '}
            <span className="text-primary">Visão</span>
            , a nossa prioridade
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Cuidados de excelência em medicina dentária e oftalmologia, com uma equipa
            dedicada ao seu bem-estar.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={scrollToMarcacao}
              className="bg-primary hover:bg-primary/90 text-lg px-8"
            >
              Marcar Consulta
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToSobre}
              className="text-lg px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Conhecer a Clínica
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToSobre}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-primary"
        >
          <ArrowDown className="w-8 h-8" />
        </button>
      </div>
    </section>
  );
}
