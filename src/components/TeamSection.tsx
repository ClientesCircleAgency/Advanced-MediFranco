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

export function TeamSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <section id="equipa" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-4">
              <span className="text-sm font-medium text-accent-foreground">Equipa</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              A Nossa <span className="text-primary">Equipa</span>
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Conheça os profissionais que fazem a diferença na sua saúde.
            </p>
          </div>

          {/* Team Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-left group ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-28 h-28 rounded-2xl mx-auto object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {member.specialty}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-foreground text-center group-hover:text-primary transition-colors">
                  {member.name}
                </h4>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {member.role}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Member Modal */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md rounded-2xl">
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
                className="w-32 h-32 rounded-2xl mx-auto mb-4 object-cover shadow-lg"
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
