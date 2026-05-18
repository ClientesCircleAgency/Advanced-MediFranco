import { Link } from 'react-router-dom';
import logo from '@/assets/logo-medifranco.png';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img
                alt="MediFranco"
                src={logo}
                className="h-14 w-auto max-w-[240px] mx-auto mb-2 transition-transform duration-300 hover:scale-105"
              />
            </Link>
          </div>
          {children}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
