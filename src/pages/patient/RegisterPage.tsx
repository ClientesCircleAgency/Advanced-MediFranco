import { AuthLayout } from '@/components/auth/AuthLayout';
import { PatientRegisterForm } from '@/components/auth/PatientRegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <h2 className="font-display text-xl font-semibold text-foreground text-center mb-1">
        Criar Conta
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Registe-se para aceder à sua área de cliente.
      </p>
      <PatientRegisterForm />
    </AuthLayout>
  );
}
