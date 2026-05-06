import { AuthLayout } from '@/components/auth/AuthLayout';
import { PatientLoginForm } from '@/components/auth/PatientLoginForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="font-display text-xl font-semibold text-foreground text-center mb-1">
        Área de Cliente
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Aceda à sua conta para gerir consultas e documentos.
      </p>
      <PatientLoginForm />
    </AuthLayout>
  );
}
