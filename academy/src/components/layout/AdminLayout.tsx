import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, BookOpen, Users, DollarSign, LogOut } from 'lucide-react'

interface AdminLayoutProps {
    children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const { signOut } = useAuth()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/courses', label: 'Cursos', icon: BookOpen },
        { path: '/admin/courses', label: 'Inscritos', icon: Users, badge: 'Via Cursos' },
        { path: '/admin/sales', label: 'Vendas', icon: DollarSign },
    ]

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin'
        }
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-muted/30 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-background border-r border-border flex-shrink-0 hidden lg:flex lg:flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-border">
                    <Link to="/admin" className="block">
                        <h1 className="text-xl font-display font-bold">
                            MediFranco Academy
                        </h1>
                        <p className="text-sm text-muted-foreground">Administração</p>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.path)

                        return (
                            <Link
                                key={item.path + item.label}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                    ${active
                                        ? 'bg-primary text-primary-foreground font-medium'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <span className="flex-1">{item.label}</span>
                                {item.badge && (
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-4 w-4" />
                        Terminar Sessão
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}
