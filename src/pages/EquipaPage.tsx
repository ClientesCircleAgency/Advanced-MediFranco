import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHero } from '@/components/layout/PageHero';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import equipaHero from '@/assets/heroes/equipa-hero.jpg';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Calendar, ArrowRight } from 'lucide-react';
import {
  teamMembersExtended,
  getTeamByCategory,
  type TeamCategory,
  type TeamMemberExtended,
} from '@/data/team';

function TeamMemberCard({
  member,
  index,
  isVisible,
}: {
  member: TeamMemberExtended;
  index: number;
  isVisible: boolean;
}) {
  return (
    <div
      className={`group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-500 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="aspect-[4/3] bg-accent/30 flex items-center justify-center relative overflow-hidden">
        {member.image ? (
          <img
            src={member.image}
            alt={`${member.name}, ${member.role} na MediFranco`}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <span className="font-display text-2xl font-bold text-primary">
                {member.initials}
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6 text-center">
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          {member.name}
        </h3>
        <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
        <div className="inline-block bg-accent px-3 py-1 rounded-full text-xs text-muted-foreground font-medium mb-4">
          {member.specialty}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-5">
          {member.shortBio}
        </p>
        <Link
          to="/contactos"
          className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all"
        >
          <Calendar className="w-4 h-4" />
          Marcar consulta
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function TeamGrid() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.05 });
  const [activeCategory, setActiveCategory] = useState<TeamCategory>('todos');

  const filteredMembers = getTeamByCategory(activeCategory);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Tabs
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as TeamCategory)}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-12 h-14 p-1 bg-card border border-border rounded-2xl">
              <TabsTrigger
                value="todos"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl h-12 text-sm font-medium transition-all"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="oftalmologia"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl h-12 text-sm font-medium transition-all"
              >
                Oftalmologia
              </TabsTrigger>
              <TabsTrigger
                value="dentaria"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl h-12 text-sm font-medium transition-all"
              >
                Medicina Dentaria
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {filteredMembers.map((member, index) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-accent/20">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="max-w-3xl mx-auto text-center bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Marque a sua <span className="text-primary-gradient">consulta</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              A nossa equipa esta pronta para cuidar de si. Entre em contacto connosco.
            </p>
            <Link
              to="/marcar-consulta"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Marcar Consulta
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function EquipaPage() {
  return (
    <PageLayout
      title="A Nossa Equipa — Medicos Especialistas | MediFranco"
      description="Conheca os nossos oftalmologistas, dentistas e especialistas. Equipa experiente e dedicada ao seu bem-estar em Setubal."
      path="/equipa"
      ogImage="/og/equipa.jpg"
    >
      <PageHero
        title="A Nossa Equipa"
        subtitle="Especialistas dedicados ao seu bem-estar e saude."
        backgroundImage={equipaHero}
        backgroundPosition="center 48%"
        breadcrumbItems={[
          { label: 'Inicio', href: '/' },
          { label: 'Equipa' },
        ]}
      />

      <TeamGrid />
      <CTASection />
    </PageLayout>
  );
}
