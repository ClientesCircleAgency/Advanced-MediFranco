import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo-medifranco.png';

export function SimplifiedHeader() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-card/95 shadow-sm backdrop-blur-md' : 'bg-white/92 shadow-[0_12px_38px_rgba(15,23,42,0.12)] backdrop-blur-xl'}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20 md:h-24">
                    {/* Spacer for alignment */}
                    <div className="w-10 md:w-auto" />

                    {/* Centered Logo */}
                    <Link to="/" className="flex items-center">
                        <img alt="MediFranco" className="h-[4.375rem] w-auto max-w-[325px] md:h-20" src={logo} />
                    </Link>

                    {/* CTA Button */}
                    <div className="flex items-center">
                        <Button
                            asChild
                            className="bg-primary-gradient hover:opacity-90 shadow-lg hover:shadow-xl transition-all rounded-xl"
                        >
                            <Link to="/contactos">
                                <Phone className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Contactos</span>
                                <span className="sm:hidden">Contactos</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
