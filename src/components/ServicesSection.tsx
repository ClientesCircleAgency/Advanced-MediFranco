import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { dentalServices, ophthalmologyServices } from '@/data/services';
import { Service } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const IconComponent = (Icons as any)[service.icon] || Icons.Circle;

  return (
    <div
      className="group bg-background rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/50"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
        <IconComponent className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
      </div>
      <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {service.name}
      </h4>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {service.description}
      </p>
    </div>
  );
}

export function ServicesSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState('dentaria');

  return (
    <section id="servicos" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Os Nossos <span className="text-primary">Serviços</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Oferecemos uma gama completa de serviços de medicina dentária e
              oftalmologia, sempre com a mais alta qualidade.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger
                value="dentaria"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icons.Smile className="w-4 h-4 mr-2" />
                Medicina Dentária
              </TabsTrigger>
              <TabsTrigger
                value="oftalmologia"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icons.Eye className="w-4 h-4 mr-2" />
                Oftalmologia
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dentaria" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dentalServices.map((service, index) => (
                  <ServiceCard key={service.id} service={service} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="oftalmologia" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ophthalmologyServices.map((service, index) => (
                  <ServiceCard key={service.id} service={service} index={index} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
