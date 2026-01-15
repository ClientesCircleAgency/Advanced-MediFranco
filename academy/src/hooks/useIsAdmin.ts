import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook to check if the current user is an Academy admin
 */
export function useIsAdmin() {
    const { user } = useAuth()

    return useQuery({
        queryKey: ['is-admin', user?.id],
        queryFn: async () => {
            if (!user) return false

            const { data, error } = await supabase
                .rpc('is_current_user_admin')
                .returns<boolean>()

            if (error) {
                console.error('Error checking admin status:', error)
                return false
            }

            return data || false
        },
        enabled: !!user,
    })
}
