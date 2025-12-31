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
    <section id="equipa" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Team Section Header */}
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
