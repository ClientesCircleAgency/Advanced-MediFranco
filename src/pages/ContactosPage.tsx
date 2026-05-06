import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHero } from '@/components/layout/PageHero';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useAddContactMessage } from '@/hooks/useContactMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  ArrowRight,
  Facebook,
  Instagram,
  Youtube,
} from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email invalido').max(255),
  phone: z.string().min(9, 'Telefone invalido').max(20),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: MapPin,
    label: 'Morada',
    value: 'Rua dos Comediantes n 13 r/c - C\n2910-468 Setubal',
    href: 'https://maps.google.com/?q=Rua+dos+Comediantes+13,+2910-468+Setubal',
  },
  {
    icon: Phone,
    label: 'Telefone',
    value: '265 540 990 (Fixo)\n919 265 497 (Movel)',
    href: 'tel:+351265540990',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'geral@medifranco.pt',
    href: 'mailto:geral@medifranco.pt',
  },
  {
    icon: Clock,
    label: 'Horario',
    value: 'Seg - Sex: 09:00 as 19:00\nSab - Dom: Encerrado',
    href: undefined,
  },
];

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/medifranco' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/medifranco' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@medifranco' },
];

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://medifranco.pt/#business',
  name: 'MediFranco',
  image: 'https://medifranco.pt/og/homepage.jpg',
  telephone: '+351265540990',
  email: 'geral@medifranco.pt',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua dos Comediantes n 13 r/c - C',
    addressLocality: 'Setubal',
    addressRegion: 'Setubal',
    postalCode: '2910-468',
    addressCountry: 'PT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '38.5244',
    longitude: '-8.8882',
  },
  url: 'https://medifranco.pt',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '19:00',
    },
  ],
  priceRange: '$$',
};

function ContactInfoAndForm() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const addMessage = useAddContactMessage();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await addMessage.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      });
      toast({
        title: 'Mensagem enviada!',
        description: 'Obrigado pelo seu contacto. Responderemos brevemente.',
      });
      reset();
    } catch {
      toast({
        title: 'Erro ao enviar',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* Left column - Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Informacao de <span className="text-primary-gradient">Contacto</span>
                </h2>
                <p className="text-muted-foreground">
                  Entre em contacto connosco por telefone, email ou visite-nos na clinica.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  const content = (
                    <div
                      className={`bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full ${
                        isVisible ? 'animate-fade-in-up' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{info.label}</p>
                        <p className="text-foreground font-medium text-sm whitespace-pre-line">
                          {info.value}
                        </p>
                      </div>
                    </div>
                  );

                  if (info.href) {
                    return (
                      <a
                        key={index}
                        href={info.href}
                        target={info.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="block"
                      >
                        {content}
                      </a>
                    );
                  }
                  return <div key={index}>{content}</div>;
                })}
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-sm text-muted-foreground">Siga-nos:</span>
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center hover:bg-primary/10 transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5 text-primary" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Right column - Form */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                Envie-nos uma Mensagem
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="page-contact-name">Nome</Label>
                  <Input
                    id="page-contact-name"
                    placeholder="O seu nome"
                    {...register('name')}
                    className={cn('rounded-xl h-12', errors.name && 'border-destructive')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="page-contact-email">Email</Label>
                    <Input
                      id="page-contact-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...register('email')}
                      className={cn('rounded-xl h-12', errors.email && 'border-destructive')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="page-contact-phone">Telefone</Label>
                    <Input
                      id="page-contact-phone"
                      type="tel"
                      placeholder="912 345 678"
                      {...register('phone')}
                      className={cn('rounded-xl h-12', errors.phone && 'border-destructive')}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="page-contact-message">Mensagem</Label>
                  <Textarea
                    id="page-contact-message"
                    placeholder="A sua mensagem..."
                    rows={5}
                    {...register('message')}
                    className={cn(
                      'rounded-xl resize-none',
                      errors.message && 'border-destructive'
                    )}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-gradient hover:opacity-90 shadow-lg hover:shadow-xl transition-all rounded-xl h-14 text-base"
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'A enviar...' : 'Enviar Mensagem'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MapSection() {
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
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Como <span className="text-primary-gradient">Chegar</span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3118.123456789!2d-8.893333!3d38.523889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd194330b6b4f1c1%3A0x1234567890abcdef!2sRua%20dos%20Comediantes%2013%2C%202910-468%20Set%C3%BAbal!5e0!3m2!1spt-PT!2spt!4v1700000000000!5m2!1spt-PT!2spt"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localizacao da MediFranco em Setubal"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function OnlineCTA() {
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
              Prefere consulta <span className="text-primary-gradient">online</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Brevemente podera consultar os nossos especialistas por videochamada, sem sair
              de casa.
            </p>
            <Link
              to="/consultas-online"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Saber Mais
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ContactosPage() {
  return (
    <PageLayout
      title="Contactos — MediFranco Setubal | Marcar Consulta"
      description="Rua dos Comediantes n 13, Setubal. Tel: 265 540 990. Seg-Sex 09h-19h. Marque a sua consulta na MediFranco."
      path="/contactos"
      ogImage="/og/contactos.jpg"
    >
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      <PageHero
        title="Contactos"
        subtitle="Entre em contacto connosco. Estamos aqui para ajudar."
        breadcrumbItems={[
          { label: 'Inicio', href: '/' },
          { label: 'Contactos' },
        ]}
      />

      <ContactInfoAndForm />
      <MapSection />
      <OnlineCTA />
    </PageLayout>
  );
}
