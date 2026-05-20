import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHero } from '@/components/layout/PageHero';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import equipaHero from '@/assets/heroes/equipa-hero.jpg';
import {
  getTeamByCategory,
  teamMembersExtended,
  type TeamCategory,
  type TeamMemberExtended,
} from '@/data/team';

const ownerIds = ['antonio-franco', 'helena-franco', 'pedro-franco'];

const portraitOffsets: Partial<Record<string, string>> = {
  'antonio-franco': 'translate-y-6',
  'claudia-patricio': 'translate-y-6',
  'helena-franco': '-translate-y-2',
  'pedro-franco': 'translate-y-6',
  'nuno-bangola': 'translate-y-6',
  'vitor-coimbra': 'translate-y-6',
};

const categoryTabs: Array<{
  value: TeamCategory;
  label: string;
  icon: typeof Users;
}> = [
  { value: 'todos', label: 'Todos', icon: Users },
  { value: 'oftalmologia', label: 'Oftalmologia', icon: Eye },
  { value: 'dentaria', label: 'Dentária', icon: Smile },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      {children}
    </span>
  );
}

function TeamPortrait({
  member,
  compact = false,
}: {
  member: TeamMemberExtended;
  compact?: boolean;
}) {
  const offsetClass = portraitOffsets[member.id] ?? '';

  return (
    <div className={`relative z-0 w-full overflow-visible ${compact ? '-mb-12 h-72' : '-mb-14 h-80'}`}>
      <img
        src={member.image}
        alt={`${member.name}, ${member.role} na MediFranco`}
        className={`mx-auto h-full w-auto max-w-[96%] object-contain object-bottom saturate-100 drop-shadow-2xl transition-transform duration-300 group-hover:scale-[1.03] ${offsetClass}`}
        loading="lazy"
      />
    </div>
  );
}

function MemberInfoCard({
  member,
  compact = false,
}: {
  member: TeamMemberExtended;
  compact?: boolean;
}) {
  return (
    <div className="relative z-10 flex w-full flex-1 flex-col items-center rounded-2xl border border-border bg-card p-6 pt-12 text-center shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-xl">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
        <Stethoscope className="h-5 w-5" aria-hidden="true" />
      </div>

      <h3 className="font-display text-xl font-bold leading-tight text-foreground">{member.name}</h3>
      <p className="mt-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-primary">
        {member.role}
      </p>
      <span className="mt-3 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-muted-foreground">
        {member.specialty}
      </span>

      <p className={`mt-5 text-sm leading-relaxed text-muted-foreground ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
        {member.shortBio}
      </p>

      <Link
        to="/contactos"
        className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-bold text-primary outline-none transition-all hover:gap-3 focus-visible:rounded-full focus-visible:ring-4 focus-visible:ring-primary/25"
        aria-label={`Contactar a MediFranco sobre ${member.name}`}
      >
        <Calendar className="h-4 w-4" aria-hidden="true" />
        Contactos
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

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
    <article
      className={`group relative flex min-h-[520px] flex-col items-center pt-4 transition-all duration-300 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <TeamPortrait member={member} />
      <MemberInfoCard member={member} />
    </article>
  );
}

function TeamIntro() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.12 });

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container relative z-10 mx-auto px-4">
        <div
          ref={ref}
          className={`grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end transition-all duration-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="max-w-3xl">
            <SectionLabel>Equipa clínica</SectionLabel>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
              Especialistas próximos, coordenados e focados numa medicina clara.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A equipa MediFranco combina oftalmologia, medicina dentária e acompanhamento clínico
              com uma abordagem simples: ouvir, avaliar e orientar cada pessoa com responsabilidade.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <dl className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-accent/50 p-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Equipa</dt>
                <dd className="mt-2 font-display text-3xl font-bold text-primary">{teamMembersExtended.length}</dd>
              </div>
              <div className="rounded-xl bg-accent/50 p-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Áreas</dt>
                <dd className="mt-2 font-display text-3xl font-bold text-primary">2</dd>
              </div>
              <div className="rounded-xl bg-accent/50 p-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Desde</dt>
                <dd className="mt-2 font-display text-3xl font-bold text-primary">2000</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeadershipSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.08 });
  const owners = teamMembersExtended.filter((member) => ownerIds.includes(member.id));

  return (
    <section className="relative overflow-hidden bg-muted/30 py-16 md:py-24">
      <div className="absolute left-1/2 top-4 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="container relative z-10 mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <SectionLabel>Direção MediFranco</SectionLabel>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              A liderança clínica da casa
            </h2>
            <p className="mt-4 text-muted-foreground">
              Os três Franco aparecem sempre em primeiro lugar nos mostradores da equipa, pela sua
              ligação directa à direção e identidade da clínica.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
            {owners.map((member, index) => (
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

function TeamGrid() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.05 });
  const [activeCategory, setActiveCategory] = useState<TeamCategory>('todos');

  const filteredMembers = useMemo(() => getTeamByCategory(activeCategory), [activeCategory]);

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="mx-auto mb-12 flex max-w-6xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <SectionLabel>Equipa completa</SectionLabel>
              <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
                Escolha por área clínica
              </h2>
            </div>

            <Tabs
              value={activeCategory}
              onValueChange={(value) => setActiveCategory(value as TeamCategory)}
              className="w-full md:w-auto"
            >
              <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl border border-border bg-card p-1 shadow-sm md:w-[34rem]">
                {categoryTabs.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="min-h-11 gap-2 rounded-xl px-2 text-xs font-bold outline-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground focus-visible:ring-4 focus-visible:ring-primary/25 sm:text-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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

function PrinciplesSection() {
  const principles = [
    {
      icon: ShieldCheck,
      title: 'Rigor clínico',
      text: 'Avaliação cuidada, encaminhamento claro e comunicação responsável em cada etapa.',
    },
    {
      icon: Users,
      title: 'Coordenação entre áreas',
      text: 'Oftalmologia e medicina dentária trabalham com uma visão integrada da pessoa.',
    },
    {
      icon: CheckCircle2,
      title: 'Atendimento claro',
      text: 'Explicações simples, próximos passos objectivos e contacto directo com a clínica.',
    },
  ];

  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-2xl border border-primary/20 bg-card p-8 text-center shadow-lg md:p-12">
          <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Award className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Precisa de saber qual a consulta indicada?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Fale connosco. A equipa encaminha o seu pedido para a área certa e ajuda-o a encontrar
            a forma de acompanhamento mais adequada.
          </p>
          <Link
            to="/contactos"
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg outline-none transition-all hover:opacity-90 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-primary/25"
          >
            Contactos
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function EquipaPage() {
  return (
    <PageLayout
      title="A Nossa Equipa - Médicos Especialistas | MediFranco"
      description="Conheça os nossos especialistas em oftalmologia e medicina dentária. Equipa experiente e dedicada ao seu bem-estar em Setúbal."
      path="/equipa"
      ogImage="/og/equipa.jpg"
    >
      <PageHero
        title="A Nossa Equipa"
        subtitle="Especialistas dedicados ao seu bem-estar e saúde."
        backgroundImage={equipaHero}
        backgroundPosition="center 48%"
        breadcrumbItems={[
          { label: 'Início', href: '/' },
          { label: 'Equipa' },
        ]}
      />

      <TeamIntro />
      <LeadershipSection />
      <TeamGrid />
      <PrinciplesSection />
      <CTASection />
    </PageLayout>
  );
}
