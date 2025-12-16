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
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in-up">
          {/* Logo */}
          <img
            src={logo}
            alt="MediFranco"
            className="h-28 md:h-36 lg:h-44 w-auto mx-auto mb-6 drop-shadow-lg"
          />

          {/* Main Tagline */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 leading-tight">
            Cuidamos da sua{' '}
            <span className="text-primary">visão</span>
            {' '}e do seu{' '}
            <span className="text-primary">sorriso</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Especialistas em Oftalmologia e Medicina Dentária.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={scrollToMarcacao}
              className="bg-primary hover:bg-primary/90 text-base px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              Marcar Consulta
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToSobre}
              className="text-base px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 active:scale-95"
            >
              Conhecer a Clínica
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
