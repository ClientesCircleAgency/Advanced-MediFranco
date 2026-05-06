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
import { ArrowRight, Calendar } from 'lucide-react';
import { ophthalmologyServices } from '@/data/services';
import { teamMembersExtended, ophthalmologyTeamIds } from '@/data/team';

const ophthalmologyTeam = teamMembersExtended.filter((m) =>
  ophthalmologyTeamIds.includes(m.id)
);

const extendedDescriptions: Record<string, string> = {
  'consulta-oftalmologia':
    'A consulta de oftalmologia na MediFranco inclui uma avaliacao completa da saude visual, com exames de acuidade visual, pressao intraocular e fundo de olho. O nosso objectivo e detectar precocemente qualquer alteracao e definir o melhor plano de tratamento.',
  'cirurgia-refrativa':
    'A cirurgia refrativa corrige problemas de visao como miopia, hipermetropia e astigmatismo, reduzindo ou eliminando a dependencia de oculos e lentes de contacto. Utilizamos tecnologia laser de ultima geracao para resultados precisos e seguros.',
  cataratas:
    'A cirurgia de cataratas consiste na remocao do cristalino opaco e implante de uma lente intraocular, restaurando a visao nitida. E um procedimento seguro e eficaz, realizado com tecnicas modernas que permitem uma recuperacao rapida.',
  glaucoma:
    'O glaucoma e uma doenca silenciosa que pode levar a perda irreversivel da visao. Na MediFranco, realizamos diagnostico precoce atraves de medicao da pressao intraocular e exame do nervo optico, iniciando tratamento para controlar a progressao da doenca.',
  retinopatia:
    'Tratamos doencas da retina como a degeneracao macular e a retinopatia diabetica, utilizando retinografia digital de alta resolucao para diagnostico preciso e acompanhamento evolutivo das patologias retinianas.',
  'lentes-contacto':
    'O nosso servico de contactologia inclui a adaptacao personalizada de lentes de contacto, avaliando as necessidades visuais e as caracteristicas de cada olho para garantir a maxima correcao visual com conforto durante todo o dia.',
};

const faqs = [
  {
    question: 'Com que frequencia devo fazer um exame oftalmologico?',
    answer:
      'Recomendamos um exame oftalmologico anual para adultos, especialmente apos os 40 anos. Criancas devem ter o primeiro exame aos 3 anos e depois anualmente. Pessoas com diabetes, historico familiar de glaucoma ou outras condicoes devem seguir as indicacoes do seu medico.',
  },
  {
    question: 'Quais sao os sintomas de cataratas?',
    answer:
      'Os sintomas mais comuns incluem visao turva ou enevoada, dificuldade em ver a noite, sensibilidade a luz e brilho, visao dupla num olho e alteracoes frequentes na graduacao dos oculos. Se sentir algum destes sintomas, marque uma consulta.',
  },
  {
    question: 'O que e o glaucoma e como posso preveni-lo?',
    answer:
      'O glaucoma e uma doenca que danifica o nervo optico, geralmente causada por pressao intraocular elevada. Como e uma doenca silenciosa, a melhor prevencao e realizar exames oftalmologicos regulares para deteccao precoce e inicio atempado do tratamento.',
  },
  {
    question: 'A cirurgia refrativa e segura?',
    answer:
      'A cirurgia refrativa e um procedimento seguro e eficaz quando realizada por profissionais qualificados e apos uma avaliacao pre-operatoria completa. Na MediFranco, fazemos uma avaliacao detalhada para determinar se o paciente e candidato adequado ao procedimento.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  about: { '@type': 'MedicalSpecialty', name: 'Ophthalmology' },
  mainEntity: ophthalmologyServices.map((s) => ({
    '@type': 'MedicalProcedure',
    name: s.name,
    description: s.description,
    bodyLocation: 'Eye',
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
            A MediFranco e referencia em cuidados de visao no distrito de Setubal. A nossa
            equipa de oftalmologistas e tecnicos especializados oferece consultas,
            diagnostico avancado e tratamentos de ponta para garantir a saude dos seus
            olhos.
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
              Os Nossos <span className="text-primary-gradient">Servicos</span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            {ophthalmologyServices.map((service, index) => {
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
              Equipa de <span className="text-primary-gradient">Oftalmologia</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mt-4">
              Especialistas dedicados a saude dos seus olhos.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            {ophthalmologyTeam.map((member, index) => (
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
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {member.role}
                </p>
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
              <span className="text-primary-gradient">Oftalmologia</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Cuide da sua visao com a nossa equipa de especialistas. Diagnostico preciso e
              tratamentos avancados.
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

export default function OftalmologiaPage() {
  return (
    <PageLayout
      title="Oftalmologia em Setubal — Consultas e Cirurgia | MediFranco"
      description="Consultas de oftalmologia, cirurgia de cataratas, laser e exames especializados em Setubal. Marque na MediFranco."
      path="/oftalmologia"
      ogImage="/og/oftalmologia.jpg"
    >
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <PageHero
        title="Oftalmologia"
        subtitle="Cuidados de visao especializados e tecnologia avancada."
        breadcrumbItems={[
          { label: 'Inicio', href: '/' },
          { label: 'Servicos', href: '/' },
          { label: 'Oftalmologia' },
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
