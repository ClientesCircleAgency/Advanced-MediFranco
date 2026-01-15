import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsAdmin } from '@/hooks/useIsAdmin'

interface ProtectedAdminRouteProps {
    children: React.ReactNode
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
    const { user, loading: authLoading } = useAuth()
    const { data: isAdmin, isLoading: adminLoading } = useIsAdmin()

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

    // Redirect to dashboard if not admin
    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}
