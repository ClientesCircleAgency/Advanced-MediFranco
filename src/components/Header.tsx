import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Phone, Calendar, User, ChevronDown, Eye, SmilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import logo from '@/assets/logo-medifranco.png';

const navItems = [
  { label: 'Sobre Nós', href: '/sobre-nos' },
  {
    label: 'Serviços',
    href: '#',
    children: [
      {
        label: 'Medicina Dentária',
        href: '/medicina-dentaria',
        description: 'Implantologia, Ortodontia, Endodontia...',
        icon: SmilePlus,
      },
      {
        label: 'Oftalmologia',
        href: '/oftalmologia',
        description: 'Cirurgia, Consultas, Laser...',
        icon: Eye,
      },
    ],
  },
  { label: 'Consultas Online', href: '/consultas-online' },
  { label: 'Academy', href: '/academy' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contactos', href: '/contactos' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '#') return false;
    return location.pathname === href;
  };

  const isServicesActive = () => {
    return (
      location.pathname === '/medicina-dentaria' ||
      location.pathname === '/oftalmologia'
    );
  };

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-card/95 shadow-sm backdrop-blur-md'
          : 'bg-white/92 shadow-[0_12px_38px_rgba(15,23,42,0.12)] backdrop-blur-xl'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu (Sheet) */}
          <div className="lg:hidden">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 text-foreground hover:bg-accent rounded-xl transition-colors"
                  aria-label="Abrir menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b border-border">
                  <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                  <Link to="/" onClick={() => setIsMobileOpen(false)}>
                    <img alt="MediFranco" className="h-12 w-auto max-w-[220px]" src={logo} />
                  </Link>
                </SheetHeader>

                <nav className="flex-1 overflow-y-auto p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {navItems.map((item) =>
                      item.children ? (
                        <AccordionItem key={item.label} value={item.label} className="border-b border-border">
                          <AccordionTrigger className="py-4 text-lg font-medium text-foreground hover:text-primary hover:no-underline">
                            {item.label}
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="flex flex-col gap-1 pl-4">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  to={child.href}
                                  onClick={() => setIsMobileOpen(false)}
                                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base transition-colors ${
                                    isActive(child.href)
                                      ? 'text-primary bg-accent/50 font-semibold'
                                      : 'text-foreground/80 hover:text-primary hover:bg-accent'
                                  }`}
                                >
                                  <child.icon className="w-5 h-5 flex-shrink-0" />
                                  <div>
                                    <span className="block">{child.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {child.description}
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ) : (
                        <div key={item.href} className="border-b border-border">
                          <Link
                            to={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`block py-4 text-lg font-medium transition-colors ${
                              isActive(item.href)
                                ? 'text-primary font-semibold'
                                : 'text-foreground hover:text-primary'
                            }`}
                          >
                            {item.label}
                          </Link>
                        </div>
                      )
                    )}
                  </Accordion>
                </nav>

                {/* Bottom CTAs */}
                <div className="p-4 border-t border-border space-y-3">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl justify-start"
                    asChild
                  >
                    <Link to="/area-cliente" onClick={() => setIsMobileOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Área de Cliente
                    </Link>
                  </Button>
                  <Button
                    className="w-full bg-primary-gradient hover:opacity-90 rounded-xl"
                    asChild
                  >
                    <Link to="/marcar-consulta" onClick={() => setIsMobileOpen(false)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Marcar Consulta
                    </Link>
                  </Button>
                  <a
                    href="tel:+351265540990"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-2 py-1"
                  >
                    <Phone className="w-4 h-4" />
                    265 540 990
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0"
          >
            <img alt="MediFranco" className="h-14 md:h-16 w-auto max-w-[260px]" src={logo} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      isServicesActive()
                        ? 'text-primary bg-accent/50 font-semibold'
                        : 'text-slate-800 hover:text-primary hover:bg-accent'
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
                      isDropdownOpen
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    <div className="bg-card shadow-xl border border-border rounded-xl p-2 min-w-[260px]">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive(child.href)
                              ? 'text-primary bg-accent/50'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <child.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-foreground">
                              {child.label}
                            </span>
                            <span className="block text-xs text-muted-foreground mt-0.5">
                              {child.description}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    isActive(item.href)
                      ? 'text-primary bg-accent/50 font-semibold'
                      : 'text-slate-800 hover:text-primary hover:bg-accent'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="rounded-xl text-sm font-semibold text-slate-800 hover:text-primary" asChild>
              <Link to="/area-cliente">
                <User className="w-4 h-4 mr-2" />
                Área de Cliente
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary-gradient hover:opacity-90 shadow-lg hover:shadow-xl transition-all rounded-xl text-sm"
              asChild
            >
              <Link to="/marcar-consulta">
                <Calendar className="w-4 h-4 mr-2" />
                Marcar Consulta
              </Link>
            </Button>
          </div>

          {/* Mobile: Calendar icon on right */}
          <div className="lg:hidden">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl"
              asChild
            >
              <Link to="/marcar-consulta" aria-label="Marcar Consulta">
                <Calendar className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
