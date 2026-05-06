import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import type { PatientUser } from '@/types/patient';

const profileSchema = z.object({
  full_name: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional().or(z.literal('')),
  nif: z.string().regex(/^\d{9}$/, 'NIF deve ter 9 dígitos').optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { patientUser } = useOutletContext<{ patientUser: PatientUser }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: patientUser.full_name,
      email: patientUser.email,
      phone: patientUser.phone || '',
      nif: patientUser.nif || '',
      date_of_birth: patientUser.date_of_birth || '',
    },
  });

  async function onSubmit(data: ProfileForm) {
    setIsSubmitting(true);
    const { error } = await supabase
      .from('patient_users')
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        nif: data.nif || null,
        date_of_birth: data.date_of_birth || null,
      })
      .eq('id', patientUser.id);

    setIsSubmitting(false);

    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível actualizar o perfil.', variant: 'destructive' });
    } else {
      toast({ title: 'Perfil actualizado', description: 'As suas informações foram guardadas.' });
    }
  }

  const initials = patientUser.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerir os seus dados pessoais.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
            {initials}
          </div>
          <div>
            <p className="font-medium text-lg">{patientUser.full_name}</p>
            <p className="text-sm text-muted-foreground">{patientUser.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Contacte-nos para alterar o email.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Telemóvel</Label>
              <Input id="phone" {...register('phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <Input id="nif" {...register('nif')} />
              {errors.nif && <p className="text-sm text-destructive">{errors.nif.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Data de nascimento</Label>
            <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar alterações
          </Button>
        </form>
      </div>
    </div>
  );
}
