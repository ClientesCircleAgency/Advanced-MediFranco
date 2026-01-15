import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { GraduationCap, LogOut, User } from 'lucide-react'

export function Header() {
    const { user, signOut } = useAuth()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-sm">
            <div className="container flex h-16 items-center">
                <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="text-primary-gradient">MediFranco Academy</span>
                </Link>

                <nav className="flex items-center gap-6 ml-auto">
                    <Link
                        to="/catalog"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Cursos
                    </Link>

                    {user ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Meus Cursos
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline">{user.email}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut()}
                                    className="gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Sair</span>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm">Criar Conta</Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}
