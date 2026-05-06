import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { Loader2, CheckCircle2 } from 'lucide-react';

const resetSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ResetForm = z.infer<typeof resetSchema>;

export function PatientResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const { resetPassword } = usePatientAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  async function onSubmit(data: ResetForm) {
    setIsSubmitting(true);
    const result = await resetPassword(data.email);
    setIsSubmitting(false);

    if (result.success) {
      setSent(true);
    } else {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' });
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="font-display text-lg font-semibold">Email enviado!</h3>
        <p className="text-sm text-muted-foreground">
          Verifique a sua caixa de entrada e siga as instruções para recuperar a password.
        </p>
        <Link to="/area-cliente/login" className="text-primary hover:underline text-sm font-medium">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        Introduza o seu email e enviaremos um link para recuperar a sua password.
      </p>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="o.seu@email.com" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enviar link de recuperação
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/area-cliente/login" className="text-primary hover:underline font-medium">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
