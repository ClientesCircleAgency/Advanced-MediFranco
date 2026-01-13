import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo-medifranco-v4.png';

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
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-card/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Spacer for alignment */}
                    <div className="w-10 md:w-auto" />

                    {/* Centered Logo */}
                    <Link to="/" className="flex items-center">
                        <img alt="MediFranco" className="h-20 md:h-24 w-auto" src={logo} />
                    </Link>

                    {/* CTA Button */}
                    <div className="flex items-center">
                        <Button
                            asChild
                            className="bg-primary-gradient hover:opacity-90 shadow-lg hover:shadow-xl transition-all rounded-xl"
                        >
                            <Link to="/#marcacao">
                                <Phone className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Marcar Consulta</span>
                                <span className="sm:hidden">Marcar</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
