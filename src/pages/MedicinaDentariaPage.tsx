import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHero } from '@/components/layout/PageHero';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import * as Icons from 'lucide-react';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { dentalServices } from '@/data/services';
import { teamMembersExtended, dentalTeamIds } from '@/data/team';

const dentalTeam = teamMembersExtended.filter((m) => dentalTeamIds.includes(m.id));

const extendedDescriptions: Record<string, string> = {
  ortodontia:
    'A ortodontia corrige o alinhamento dos dentes e a oclusao, melhorando tanto a estetica como a funcionalidade. Na MediFranco, oferecemos aparelhos fixos, removiveis e alinhadores invisiveis, adequados a criancas, adolescentes e adultos.',
  implantologia:
    'Os implantes dentarios sao a solucao mais avancada para substituir dentes perdidos. Utilizamos implantes de titanio de alta qualidade que se integram naturalmente com o osso, devolvendo funcao mastigatoria e estetica com resultados duradouros.',
  branqueamento:
    'O branqueamento dentario profissional permite clarear os dentes de forma segura, removendo manchas e descoloracoes. Utilizamos tecnicas clinicamente comprovadas que proporcionam resultados visiveis e duradouros sem comprometer a saude do esmalte.',
  proteses:
    'As proteses dentarias, fixas ou removiveis, permitem substituir dentes em falta e recuperar a funcao mastigatoria e a estetica do sorriso. Trabalhamos com materiais de alta qualidade para maxima naturalidade e conforto.',
  endodontia:
    'A endodontia trata o interior do dente quando a polpa esta inflamada ou infectada, normalmente devido a caries profundas ou traumas. O tratamento de canal preserva o dente natural, evitando a extraccao.',
  'cirurgia-oral':
    'A cirurgia oral abrange procedimentos como extracao de sisos inclusos, cirurgias pre-proteticas, enxertos osseos e tratamento de patologias da cavidade oral. Realizamos todos os procedimentos com tecnicas minimamente invasivas.',
};

const faqs = [
  {
    question: 'Quanto custa um implante dentario na MediFranco?',
    answer:
      'O valor de um implante dentario varia consoante a complexidade do caso. Marque uma consulta de avaliacao para receber um orcamento personalizado e conhecer todas as opcoes disponiveis.',
  },
  {
    question: 'A ortodontia e so para criancas?',
    answer:
      'Nao, a ortodontia pode ser realizada em qualquer idade. Temos opcoes de aparelhos fixos e removiveis para adultos, incluindo solucoes esteticas mais discretas como alinhadores invisiveis.',
  },
  {
    question: 'Com que frequencia devo fazer uma limpeza dentaria?',
    answer:
      'Recomendamos uma limpeza profissional a cada 6 meses para manter a saude oral. Em casos especificos, o seu dentista pode recomendar intervalos diferentes.',
  },
  {
    question: 'O tratamento de canal doi?',
    answer:
      'Com as tecnicas modernas e anestesia adequada, o tratamento de canal e praticamente indolor. A maior parte dos pacientes compara a experiencia a uma restauracao dentaria comum. O desconforto pos-tratamento e minimo e facilmente controlavel.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  about: { '@type': 'MedicalSpecialty', name: 'Dentistry' },
  mainEntity: dentalServices.map((s) => ({
    '@type': 'MedicalProcedure',
    name: s.name,
    description: s.description,
    bodyLocation: 'Mouth',
  })),
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

function IntroSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Na MediFranco, a sua saude oral e a nossa prioridade. A nossa equipa de
            especialistas oferece cuidados dentarios completos e personalizados, desde a
            prevencao ate aos tratamentos mais avancados, num ambiente acolhedor e com
            tecnologia de ponta.
          </p>
        </div>
      </div>
    </section>
  );
}

function ServicesDetailSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.05 });

  return (
    <section className="py-16 md:py-24 bg-accent/20">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              As Nossas <span className="text-primary-gradient">Especialidades</span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            {dentalServices.map((service, index) => {
              const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[service.icon] || Icons.Circle;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={service.id}
                  className={`bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-500 ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`flex flex-col ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    } items-stretch`}
                  >
                    {service.image && (
                      <div className="md:w-2/5 h-48 md:h-auto relative overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent md:bg-none" />
                      </div>
                    )}
                    <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                          {service.name}
                        </h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {extendedDescriptions[service.id] || service.description}
                      </p>
                      <Link
                        to="/contactos"
                        className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all w-fit"
                      >
                        <Calendar className="w-4 h-4" />
                        Marcar Consulta
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamHighlightSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Equipa de <span className="text-primary-gradient">Medicina Dentaria</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mt-4">
              Profissionais especializados em diferentes areas da medicina dentaria.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto">
            {dentalTeam.map((member, index) => (
              <div
                key={member.id}
                className={`text-center group ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/50 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-lg font-bold text-primary">
                      {member.initials}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{member.role}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/equipa"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
            >
              Ver toda a equipa
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
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
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Perguntas <span className="text-primary-gradient">Frequentes</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-lg data-[state=open]:border-primary/30 transition-all"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-5 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="max-w-3xl mx-auto text-center bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Marque a sua consulta de{' '}
              <span className="text-primary-gradient">Medicina Dentaria</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Cuide do seu sorriso com a nossa equipa de especialistas. Atendimento
              personalizado e tecnologia de ponta.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contactos"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                Marcar Consulta
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/consultas-online"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                Ou consulte online
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MedicinaDentariaPage() {
  return (
    <PageLayout
      title="Medicina Dentaria em Setubal — Implantes, Ortodontia | MediFranco"
      description="Implantologia, ortodontia, endodontia e mais. Tratamentos dentarios completos em Setubal. Marque a sua consulta na MediFranco."
      path="/medicina-dentaria"
      ogImage="/og/medicina-dentaria.jpg"
    >
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <PageHero
        title="Medicina Dentaria"
        subtitle="Cuidados dentarios completos e personalizados."
        breadcrumbItems={[
          { label: 'Inicio', href: '/' },
          { label: 'Servicos', href: '/' },
          { label: 'Medicina Dentaria' },
        ]}
      />

      <IntroSection />
      <ServicesDetailSection />
      <TeamHighlightSection />
      <FAQSection />
      <CTABanner />
    </PageLayout>
  );
}
