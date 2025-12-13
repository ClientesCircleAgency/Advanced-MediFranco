import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin } from 'lucide-react';
import logo from '@/assets/logo-medifranco.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo & About */}
          <div className="space-y-4">
            <img src={logo} alt="MediFranco" className="h-12 w-auto brightness-0 invert" />
            <p className="text-background/70 text-sm leading-relaxed">
              Cuidados de excelência em medicina dentária e oftalmologia há mais de 15 anos.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {[
                { label: 'Início', href: '#hero' },
                { label: 'Sobre Nós', href: '#sobre' },
                { label: 'Serviços', href: '#servicos' },
                { label: 'Testemunhos', href: '#testemunhos' },
                { label: 'Contactos', href: '#contactos' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Serviços</h4>
            <ul className="space-y-2">
              {[
                'Ortodontia',
                'Implantologia',
                'Branqueamento',
                'Cirurgia Refrativa',
                'Cataratas',
                'Glaucoma',
              ].map((service) => (
                <li key={service}>
                  <span className="text-background/70 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contactos */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contactos</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-background/70 text-sm">
                  Av. Francisco Sá Carneiro 43, Rio de Mouro
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+351219123456" className="text-background/70 hover:text-primary text-sm">
                  +351 219 123 456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:geral@medifranco.pt" className="text-background/70 hover:text-primary text-sm">
                  geral@medifranco.pt
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-background/70 text-sm">
                  <p>Seg-Sex: 9h às 19h</p>
                  <p>Sábado: 9h às 13h</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © {currentYear} MediFranco. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-background/50 hover:text-primary text-sm transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-background/50 hover:text-primary text-sm transition-colors">
              Termos e Condições
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
