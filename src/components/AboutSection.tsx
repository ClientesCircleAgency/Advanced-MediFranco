import { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { teamMembers } from '@/data/team';
import { TeamMember } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import fundadoresImg from '@/assets/fundadores.png';

export function AboutSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <section id="sobre" className="py-16 md:py-24 bg-secondary/30">
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
              Sobre a <span className="text-primary">MediFranco</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Há mais de 15 anos a cuidar da sua saúde oral e visual, com uma equipa
              de profissionais dedicados e tecnologia de ponta.
            </p>
          </div>

          {/* Founders Section */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
              {/* Founders Image */}
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={fundadoresImg}
                    alt="Os Fundadores da MediFranco"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-accent/30 rounded-full blur-3xl" />
              </div>

              {/* Founders Story */}
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  A Nossa <span className="text-primary">História</span>
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { number: '15+', label: 'Anos de Experiência' },
              { number: '10.000+', label: 'Pacientes Satisfeitos' },
              { number: '3', label: 'Especialistas' },
              { number: '12', label: 'Serviços' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Team Section */}
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              A Nossa Equipa
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Conheça os profissionais que fazem a diferença na sua saúde.
            </p>
          </div>

          {/* Team Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`bg-background rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-left ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h4 className="text-lg font-semibold text-foreground text-center">
                  {member.name}
                </h4>
                <p className="text-primary text-sm text-center mb-1">{member.role}</p>
                <p className="text-muted-foreground text-sm text-center">
                  {member.specialty}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Member Modal */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {selectedMember?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="text-center">
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-foreground mb-1">
                {selectedMember.name}
              </h3>
              <p className="text-primary font-medium mb-1">{selectedMember.role}</p>
              <p className="text-muted-foreground text-sm mb-4">
                {selectedMember.specialty}
              </p>
              <p className="text-foreground/80 text-sm leading-relaxed">
                {selectedMember.bio}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
