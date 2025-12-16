import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon, Clock, Send } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const appointmentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().min(9, 'Telefone inválido').max(20),
  nif: z.string().length(9, 'NIF deve ter 9 dígitos').regex(/^\d+$/, 'NIF deve conter apenas números'),
  serviceType: z.enum(['dentaria', 'oftalmologia'], { required_error: 'Selecione o tipo de consulta' }),
  preferredDate: z.string().min(1, 'Selecione uma data'),
  preferredTime: z.string().min(1, 'Selecione uma hora'),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];

export function AppointmentSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('medifranco_appointments', []);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const watchServiceType = watch('serviceType');

  const onSubmit = async (data: AppointmentFormData) => {
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      nif: data.nif,
      serviceType: data.serviceType,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setAppointments([...appointments, newAppointment]);
    
    toast({
      title: 'Marcação enviada!',
      description: 'Entraremos em contacto brevemente para confirmar a sua consulta.',
    });

    reset();
    setSelectedDate(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setValue('preferredDate', format(date, 'yyyy-MM-dd'));
    }
  };

  return (
    <section id="marcacao" className="py-16 md:py-24 bg-secondary/30">
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
              Marque a sua <span className="text-primary">Consulta</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Preencha o formulário abaixo e entraremos em contacto para confirmar
              a sua marcação.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto bg-background rounded-2xl p-6 md:p-8 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="O seu nome"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* NIF */}
              <div className="space-y-2">
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  placeholder="123456789"
                  maxLength={9}
                  {...register('nif')}
                  className={errors.nif ? 'border-destructive' : ''}
                />
                {errors.nif && (
                  <p className="text-sm text-destructive">{errors.nif.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="912 345 678"
                  {...register('phone')}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              {/* Service Type */}
              <div className="space-y-2 md:col-span-2">
                <Label>Tipo de Consulta</Label>
                <Select
                  onValueChange={(value: 'dentaria' | 'oftalmologia') => {
                    setValue('serviceType', value);
                  }}
                >
                  <SelectTrigger className={errors.serviceType ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione o tipo de consulta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oftalmologia">Oftalmologia</SelectItem>
                    <SelectItem value="dentaria">Medicina Dentária</SelectItem>
                  </SelectContent>
                </Select>
                {errors.serviceType && (
                  <p className="text-sm text-destructive">{errors.serviceType.message}</p>
                )}
              </div>

              {/* Date - Visual Calendar */}
              <div className="space-y-2">
                <Label>Data Preferida</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                        errors.preferredDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP", { locale: pt })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const day = date.getDay();
                        // Disable past dates and Sundays
                        return date < today || day === 0;
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.preferredDate && (
                  <p className="text-sm text-destructive">{errors.preferredDate.message}</p>
                )}
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label>Hora Preferida</Label>
                <Select onValueChange={(value) => setValue('preferredTime', value)}>
                  <SelectTrigger className={errors.preferredTime ? 'border-destructive' : ''}>
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Selecione a hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'A enviar...' : 'Enviar Pedido de Marcação'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
