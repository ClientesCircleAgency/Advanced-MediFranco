import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHero } from '@/components/layout/PageHero';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  MousePointerClick,
  CalendarCheck,
  Video,
  Home,
  Zap,
  PiggyBank,
  FileText,
  Eye,
  Smile,
  Stethoscope,
  Brain,
  ArrowRight,
  Badge,
} from 'lucide-react';

const steps = [
  {
    icon: MousePointerClick,
    number: '01',
    title: 'Escolha',
    description: 'Selecione a especialidade e o profissional que pretende consultar.',
  },
  {
    icon: CalendarCheck,
    number: '02',
    title: 'Agende',
    description: 'Escolha a data e hora que mais lhe convem e confirme a marcacao.',
  },
  {
    icon: Video,
    number: '03',
    title: 'Consulte',
    description: 'Aceda a sala de espera virtual e tenha a sua consulta por videochamada.',
  },
];

const specialties = [
  {
    icon: Eye,
    title: 'Oftalmologia',
    description: 'Consultas de acompanhamento e avaliacao de sintomas visuais.',
    available: false,
  },
  {
    icon: Smile,
    title: 'Medicina Dentaria',
    description: 'Triagem, segunda opiniao e acompanhamento pos-tratamento.',
    available: false,
  },
  {
    icon: Stethoscope,
    title: 'Medicina Geral',
    description: 'Consultas gerais, renovacao de receitas e orientacao clinica.',
    available: false,
  },
  {
    icon: Brain,
    title: 'Psicologia',
    description: 'Sessoes de psicologia clinica e apoio emocional.',
    available: false,
  },
];

const benefits = [
  {
    icon: Home,
    title: 'Conforto',
    description: 'Consulte os nossos especialistas sem sair de casa, no seu ambiente.',
  },
  {
    icon: Zap,
    title: 'Rapidez',
    description: 'Menos tempo de espera e acesso mais rapido aos profissionais de saude.',
  },
  {
    icon: PiggyBank,
    title: 'Economia',
    description: 'Poupe em deslocacoes e tempo sem comprometer a qualidade do atendimento.',
  },
  {
    icon: FileText,
    title: 'Digital',
    description: 'Receitas, relatorios e documentos disponiveis digitalmente na sua area.',
  },
];

const faqs = [
  {
    question: 'O que preciso para uma consulta online?',
    answer:
      'Precisa de um dispositivo com camara e microfone (computador, tablet ou telemovel), uma ligacao estavel a internet e um local tranquilo. Aceda a sala de espera virtual 15 minutos antes.',
  },
  {
    question: 'Posso receber receitas numa consulta online?',
    answer:
      'Sim, os nossos medicos podem emitir receitas digitais durante ou apos a consulta online, que ficam disponiveis na sua area de cliente para download.',
  },
  {
    question: 'Como funciona o pagamento das consultas online?',
    answer:
      'O pagamento e feito online no momento da marcacao, por cartao de credito/debito ou MB Way, de forma segura.',
  },
  {
    question: 'A consulta online substitui a consulta presencial?',
    answer:
      'A consulta online e ideal para acompanhamentos, segundas opinioes e triagem. Em casos que necessitem de exames fisicos ou procedimentos, sera recomendada uma consulta presencial.',
  },
];

function HowItWorksSection() {
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
              Como <span className="text-primary-gradient">Funciona</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line on desktop */}
              <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-border" />

              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className={`text-center relative ${
                      isVisible ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 relative z-10">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2 block">
                      Passo {step.number}
                    </span>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecialtiesSection() {
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
              Especialidades <span className="text-primary-gradient">Disponiveis</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {specialties.map((specialty, index) => {
              const Icon = specialty.icon;
              return (
                <div
                  key={specialty.title}
                  className={`bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/30 transition-all duration-500 relative ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                      Em breve
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4 mt-2">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {specialty.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {specialty.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
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
              <span className="text-primary-gradient">Beneficios</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className={`bg-card border border-border rounded-2xl p-6 md:p-8 flex items-start gap-5 hover:shadow-lg hover:border-primary/30 transition-all duration-500 ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
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

function CTASection() {
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
              Brevemente <span className="text-primary-gradient">disponivel</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Estamos a preparar a plataforma de consultas online. Entretanto, pode marcar
              a sua consulta presencial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                disabled
                className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-8 py-4 rounded-full text-base font-medium cursor-not-allowed opacity-60"
              >
                Marcar Consulta Online
                <Video className="w-5 h-5" />
              </button>
              <Link
                to="/contactos"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                Marcar consulta presencial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ConsultasOnlinePage() {
  return (
    <PageLayout
      title="Consultas Online — Medico por Video | MediFranco"
      description="Consultas medicas online por videochamada. Oftalmologia, dentaria, psicologia e mais. Cuide-se sem sair de casa."
      path="/consultas-online"
      ogImage="/og/consultas-online.jpg"
    >
      <PageHero
        title="Consultas Online"
        subtitle="Cuide da sua saude sem sair de casa."
        breadcrumbItems={[
          { label: 'Inicio', href: '/' },
          { label: 'Consultas Online' },
        ]}
      />

      <HowItWorksSection />
      <SpecialtiesSection />
      <BenefitsSection />
      <FAQSection />
      <CTASection />
    </PageLayout>
  );
}
