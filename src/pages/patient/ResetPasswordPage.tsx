import { AuthLayout } from '@/components/auth/AuthLayout';
import { PatientResetPasswordForm } from '@/components/auth/PatientResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <h2 className="font-display text-xl font-semibold text-foreground text-center mb-1">
        Recuperar Password
      </h2>
      <PatientResetPasswordForm />
    </AuthLayout>
  );
}
