import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  full_name: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Telemóvel inválido').optional().or(z.literal('')),
  nif: z.string().regex(/^\d{9}$/, 'NIF deve ter 9 dígitos').optional().or(z.literal('')),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm_password: z.string(),
  privacy: z.boolean().refine(val => val, 'Deve aceitar a política de privacidade'),
}).refine(data => data.password === data.confirm_password, {
  message: 'As passwords não coincidem',
  path: ['confirm_password'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function PatientRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register: registerUser } = usePatientAuth();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { privacy: false },
  });

  const privacyValue = watch('privacy');

  async function onSubmit(data: RegisterForm) {
    setIsSubmitting(true);
    const result = await registerUser({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || '',
      nif: data.nif || '',
      password: data.password,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'Conta criada!', description: 'Verifique o seu email para confirmar a conta.' });
      navigate('/area-cliente');
    } else {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input id="full_name" placeholder="Maria Silva" {...register('full_name')} />
        {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="o.seu@email.com" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="phone">Telemóvel</Label>
          <Input id="phone" placeholder="912 345 678" {...register('phone')} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nif">NIF <span className="text-muted-foreground">(opcional)</span></Label>
          <Input id="nif" placeholder="123456789" {...register('nif')} />
          {errors.nif && <p className="text-sm text-destructive">{errors.nif.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirmar password</Label>
        <Input id="confirm_password" type="password" placeholder="••••••••" {...register('confirm_password')} />
        {errors.confirm_password && <p className="text-sm text-destructive">{errors.confirm_password.message}</p>}
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="privacy"
          checked={privacyValue}
          onCheckedChange={(checked) => setValue('privacy', !!checked, { shouldValidate: true })}
        />
        <Label htmlFor="privacy" className="text-sm leading-tight cursor-pointer">
          Aceito a{' '}
          <Link to="/politica-privacidade" className="text-primary hover:underline">
            política de privacidade
          </Link>
        </Label>
      </div>
      {errors.privacy && <p className="text-sm text-destructive">{errors.privacy.message}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Criar conta
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link to="/area-cliente/login" className="text-primary hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </form>
  );
}
