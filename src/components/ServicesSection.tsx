import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { dentalServices, ophthalmologyServices, newSpaceServices } from '@/data/services';
import { Service } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const IconComponent = (Icons as any)[service.icon] || Icons.Circle;

  return (
    <div
      className="group h-full overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {service.image ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <div className="w-12 h-12 rounded-xl bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 pt-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconComponent className="h-7 w-7" />
          </div>
        </div>
      )}

      <div className="p-6">
        <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {service.name}
        </h4>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {service.description}
        </p>
      </div>
    </div>
  );
}

export function ServicesSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState('dentaria');

  return (
    <section id="servicos" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-4">
              <span className="text-sm font-medium text-accent-foreground">Servicos</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Os Nossos <span className="text-primary-gradient">Servicos</span>
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              Medicina Dentaria continua no espaco atual. Oftalmologia e as novas
              especialidades passam a integrar o novo espaco MediFranco.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-1 gap-1 mb-10 h-auto p-1 bg-card border border-border rounded-2xl sm:grid-cols-3">
              <TabsTrigger
                value="dentaria"
                className="data-[state=active]:bg-primary-gradient data-[state=active]:text-primary-foreground rounded-xl h-12 text-sm font-medium transition-all"
              >
                <Icons.Smile className="w-4 h-4 mr-2" />
                Medicina Dentaria
              </TabsTrigger>
              <TabsTrigger
                value="oftalmologia"
                className="data-[state=active]:bg-primary-gradient data-[state=active]:text-primary-foreground rounded-xl h-12 text-sm font-medium transition-all"
              >
                <Icons.Eye className="w-4 h-4 mr-2" />
                Oftalmologia
              </TabsTrigger>
              <TabsTrigger
                value="novo-espaco"
                className="data-[state=active]:bg-primary-gradient data-[state=active]:text-primary-foreground rounded-xl h-12 text-sm font-medium transition-all"
              >
                <Icons.Sparkles className="w-4 h-4 mr-2" />
                Novo Espaco
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dentaria" className="mt-0">
              <div className="mb-6 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">No espaco atual:</strong> Medicina Dentaria
                mantem-se no espaco historico da MediFranco.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dentalServices.map((service, index) => (
                  <div
                    key={service.id}
                    className={isVisible ? 'animate-fade-in-up' : 'opacity-0'}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ServiceCard service={service} index={index} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="oftalmologia" className="mt-0">
              <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">No novo espaco:</strong> Oftalmologia passa a
                integrar o novo espaco MediFranco.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ophthalmologyServices.map((service, index) => (
                  <div
                    key={service.id}
                    className={isVisible ? 'animate-fade-in-up' : 'opacity-0'}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ServiceCard service={service} index={index} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="novo-espaco" className="mt-0">
              <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Novas especialidades no novo espaco:</strong>{' '}
                Medicina Geral, Optometria, Otorrinolaringologia, Psicologia, Pediatria,
                Ortoptica e Nutricao Funcional. Estas areas passam a fazer parte da oferta
                MediFranco neste novo espaco clinico.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {newSpaceServices.map((service, index) => (
                  <div
                    key={service.id}
                    className={isVisible ? 'animate-fade-in-up' : 'opacity-0'}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ServiceCard service={service} index={index} />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
