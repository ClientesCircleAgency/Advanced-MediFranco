import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Enrollment } from '@/types'

export function useEnrollments() {
    const { user } = useAuth()

    return useQuery({
        queryKey: ['enrollments', user?.id],
        queryFn: async () => {
            if (!user) return []

            const { data, error } = await supabase
                .from('academy_enrollments')
                .select(`
          *,
          course:academy_courses(*)
        `)
                .eq('user_id', user.id)

            if (error) throw error
            return (data as Enrollment[]) || []
        },
        enabled: !!user,
    })
}

export function useIsEnrolled(courseId: string) {
    const { user } = useAuth()

    return useQuery({
        queryKey: ['enrollment', courseId, user?.id],
        queryFn: async () => {
            if (!user) return false

            const { data, error } = await supabase
                .from('academy_enrollments')
                .select('id')
                .eq('user_id', user.id)
                .eq('course_id', courseId)
                .maybeSingle()

            if (error) throw error
            return !!data
        },
        enabled: !!user && !!courseId,
    })
}

export function useEnroll() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: async (courseId: string) => {
            if (!user) throw new Error('User not authenticated')

            const { data, error } = await supabase
                .from('academy_enrollments')
                .insert({
                    user_id: user.id,
                    course_id: courseId,
                    stripe_session_id: `mock_${Date.now()}`,
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['enrollment'] })
        },
    })
}
