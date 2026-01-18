import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

interface ProtectedAdminRouteProps {
    children: React.ReactNode
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
    const { user, loading: authLoading } = useAuth()
    const { data: isAdmin, isLoading: adminLoading } = useIsAdmin()
    const navigate = useNavigate()

    // Show loading while checking auth and admin status
    if (authLoading || adminLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Show Access Denied if authenticated but not admin (DO NOT redirect to /cursos)
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <div className="bg-background border border-border rounded-lg p-8 max-w-md w-full text-center shadow-lg">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
                    <p className="text-muted-foreground mb-6">
                        Esta área é exclusiva para administradores da MediFranco Academy.
                    </p>
                    <Button onClick={() => navigate('/cursos')} className="w-full">
                        Ir para Meus Cursos
                    </Button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
