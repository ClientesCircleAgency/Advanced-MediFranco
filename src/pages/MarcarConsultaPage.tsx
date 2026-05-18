import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  BadgeInfo,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Send,
  ShieldCheck,
  Smile,
  Video,
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAddAppointmentRequest } from '@/hooks/useAppointmentRequests';
import { cn } from '@/lib/utils';
import consultasOnlineHero from '@/assets/heroes/consultas-online-hero.jpg';

const bookingSchema = z.object({
  appointmentMode: z.enum(['presencial', 'online'], {
    required_error: 'Selecione o formato da consulta',
  }),
  serviceType: z.enum(['dentaria', 'oftalmologia'], {
    required_error: 'Selecione a especialidade',
  }),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().min(9, 'Telefone inválido').max(20),
  nif: z
    .string()
    .length(9, 'NIF deve ter 9 dígitos')
    .regex(/^\d+$/, 'NIF deve conter apenas números'),
  preferredDate: z.string().min(1, 'Selecione uma data'),
  preferredTime: z.string().min(1, 'Selecione uma hora'),
  message: z.string().max(500, 'A mensagem deve ter no máximo 500 caracteres').optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
];

const appointmentModes = [
  {
    value: 'presencial',
    title: 'Consulta presencial',
    description: 'Ideal para exames, tratamentos e avaliações que exigem observação clínica direta.',
    icon: MapPin,
    highlights: ['Clínica em Setúbal', 'Exames e procedimentos', 'Confirmação por contacto'],
  },
  {
    value: 'online',
    title: 'Consulta online',
    description: 'Indicada para triagem, acompanhamento, segunda opinião e esclarecimento de dúvidas.',
    icon: Video,
    highlights: ['Videochamada', 'Sem deslocação', 'Orientação inicial'],
  },
] as const;

const serviceTypes = [
  {
    value: 'oftalmologia',
    title: 'Oftalmologia',
    description: 'Visão, sintomas oculares, seguimento e avaliação clínica.',
    icon: Eye,
  },
  {
    value: 'dentaria',
    title: 'Medicina Dentária',
    description: 'Saúde oral, dor dentária, estética, prevenção e reabilitação.',
    icon: Smile,
  },
] as const;

export default function MarcarConsultaPage() {
  const addRequest = useAddAppointmentRequest();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      appointmentMode: 'presencial',
    },
  });

  const appointmentMode = watch('appointmentMode');
  const serviceType = watch('serviceType');

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setValue('preferredDate', format(date, 'yyyy-MM-dd'), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    const modeLabel = data.appointmentMode === 'online' ? 'Consulta online' : 'Consulta presencial';

    try {
      await addRequest.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        nif: data.nif,
        service_type: data.serviceType,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
        notes: [
          `Formato: ${modeLabel}`,
          data.message ? `Mensagem: ${data.message}` : null,
        ]
          .filter(Boolean)
          .join('\n'),
      });

      toast({
        title: 'Pedido de marcação enviado',
        description: 'A equipa MediFranco vai entrar em contacto para confirmar os detalhes.',
      });

      reset({ appointmentMode: data.appointmentMode });
      setSelectedDate(undefined);
    } catch {
      toast({
        title: 'Erro ao enviar pedido',
        description: 'Não foi possível enviar a marcação. Tente novamente dentro de momentos.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageLayout
      title="Marcar Consulta Online ou Presencial | MediFranco"
      description="Marque a sua consulta presencial em Setúbal ou solicite uma consulta online de oftalmologia e medicina dentária."
      path="/marcar-consulta"
      ogImage="/og/homepage.jpg"
    >
      <PageHero
        title="Marcar Consulta"
        subtitle="Escolha entre consulta presencial ou online e envie o seu pedido de marcação à equipa MediFranco."
        backgroundImage={consultasOnlineHero}
        backgroundPosition="center 54%"
        breadcrumbItems={[
          { label: 'Início', href: '/' },
          { label: 'Marcar Consulta' },
        ]}
      />

      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Pedido seguro
                </span>
                <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
                  O primeiro passo para um plano claro.
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Depois de enviar o pedido, a equipa confirma disponibilidade, formato da consulta e próximos passos.
                </p>
                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Resposta por telefone ou email
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Pode indicar sintomas ou objetivo da consulta
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Online recomendado para triagem e seguimento
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
                <div className="flex gap-3">
                  <BadgeInfo className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-foreground">
                    Em casos urgentes, contacte diretamente a clínica por telefone para avaliação mais rápida.
                  </p>
                </div>
              </div>
            </aside>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-2xl border border-border bg-card p-5 shadow-lg md:p-8"
            >
              <div className="mb-8">
                <Label className="mb-4 block text-base font-semibold">Formato da consulta</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  {appointmentModes.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = appointmentMode === mode.value;

                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() =>
                          setValue('appointmentMode', mode.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className={cn(
                          'rounded-2xl border-2 p-5 text-left transition-all',
                          isActive
                            ? 'border-primary bg-accent shadow-sm'
                            : 'border-border bg-background hover:border-primary/40'
                        )}
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
                            <Icon className="h-5 w-5" />
                          </span>
                          {isActive && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                          {mode.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {mode.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {mode.highlights.map((highlight) => (
                            <span
                              key={highlight}
                              className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.appointmentMode && (
                  <p className="mt-2 text-sm text-destructive">{errors.appointmentMode.message}</p>
                )}
              </div>

              <div className="mb-8">
                <Label className="mb-4 block text-base font-semibold">Especialidade</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  {serviceTypes.map((service) => {
                    const Icon = service.icon;
                    const isActive = serviceType === service.value;

                    return (
                      <button
                        key={service.value}
                        type="button"
                        onClick={() =>
                          setValue('serviceType', service.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className={cn(
                          'rounded-2xl border-2 p-5 text-left transition-all',
                          isActive
                            ? 'border-primary bg-accent shadow-sm'
                            : 'border-border bg-background hover:border-primary/40'
                        )}
                      >
                        <Icon className={cn('mb-4 h-7 w-7', isActive ? 'text-primary' : 'text-muted-foreground')} />
                        <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                          {service.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {service.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {errors.serviceType && (
                  <p className="mt-2 text-sm text-destructive">{errors.serviceType.message}</p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="O seu nome"
                    {...register('name')}
                    className={cn('h-12 rounded-xl', errors.name && 'border-destructive')}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    placeholder="123456789"
                    maxLength={9}
                    {...register('nif')}
                    className={cn('h-12 rounded-xl', errors.nif && 'border-destructive')}
                  />
                  {errors.nif && <p className="text-sm text-destructive">{errors.nif.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                    className={cn('h-12 rounded-xl', errors.email && 'border-destructive')}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="912 345 678"
                    {...register('phone')}
                    className={cn('h-12 rounded-xl', errors.phone && 'border-destructive')}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Data preferida</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'h-12 w-full justify-start rounded-xl text-left font-normal',
                          !selectedDate && 'text-muted-foreground',
                          errors.preferredDate && 'border-destructive'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP', { locale: pt }) : 'Selecione uma data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto rounded-2xl p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const day = date.getDay();
                          return date < today || day === 0;
                        }}
                        initialFocus
                        className="pointer-events-auto rounded-2xl"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.preferredDate && (
                    <p className="text-sm text-destructive">{errors.preferredDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Hora preferida</Label>
                  <Select onValueChange={(value) => setValue('preferredTime', value, { shouldValidate: true })}>
                    <SelectTrigger className={cn('h-12 rounded-xl', errors.preferredTime && 'border-destructive')}>
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Selecione a hora" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time} className="rounded-lg">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.preferredTime && (
                    <p className="text-sm text-destructive">{errors.preferredTime.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Label htmlFor="message">Motivo da consulta</Label>
                <Textarea
                  id="message"
                  placeholder="Ex: dor, revisão, segunda opinião, acompanhamento, sintomas..."
                  {...register('message')}
                  className={cn('min-h-28 rounded-xl', errors.message && 'border-destructive')}
                />
                {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 h-14 w-full rounded-xl bg-primary-gradient text-base shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
                size="lg"
              >
                <Send className="mr-2 h-5 w-5" />
                {isSubmitting ? 'A enviar...' : 'Enviar pedido de marcação'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
