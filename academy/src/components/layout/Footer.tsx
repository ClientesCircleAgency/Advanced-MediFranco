import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-card mt-auto">
            <div className="container py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <span>MediFranco Academy</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Formação online de excelência para profissionais de saúde.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Links Rápidos</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/catalog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Cursos
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Meus Cursos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Contacto</h3>
                        <p className="text-sm text-muted-foreground">
                            MediFranco<br />
                            Av. Francisco Sá Carneiro 43<br />
                            Rio de Mouro, Portugal
                        </p>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {currentYear} MediFranco Academy. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
