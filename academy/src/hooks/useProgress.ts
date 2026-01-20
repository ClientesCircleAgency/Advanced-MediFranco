import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Progress } from '@/types'

export function useProgress(courseId?: string) {
    const { user } = useAuth()

    return useQuery({
        queryKey: ['progress', user?.id, courseId],
        queryFn: async () => {
            if (!user) return []

            if (courseId) {
                // First get module IDs for the course
                const { data: modules } = await supabase
                    .from('academy_modules')
                    .select('id')
                    .eq('course_id', courseId)

                if (!modules || modules.length === 0) return []

                const moduleIds = modules.map(m => m.id)

                // Then get lesson IDs for those modules
                const { data: lessons } = await supabase
                    .from('academy_lessons')
                    .select('id')
                    .in('module_id', moduleIds)

                if (!lessons || lessons.length === 0) return []

                const lessonIds = lessons.map(l => l.id)

                // Finally get progress for those lessons
                const { data, error } = await supabase
                    .from('academy_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('lesson_id', lessonIds)

                if (error) throw error
                return (data as Progress[]) || []
            } else {
                // Get all progress for user
                const { data, error } = await supabase
                    .from('academy_progress')
                    .select('*')
                    .eq('user_id', user.id)

                if (error) throw error
                return (data as Progress[]) || []
            }
        },
        enabled: !!user,
    })
}

export function useMarkLessonComplete() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: async (lessonId: string) => {
            if (!user) throw new Error('User not authenticated')

            const { data, error } = await supabase
                .from('academy_progress')
                .insert({
                    user_id: user.id,
                    lesson_id: lessonId,
                })
                .select()
                .single()

            if (error) {
                // If already completed, ignore duplicate key error
                if (error.code === '23505') return null
                throw error
            }

            return data
        },
        onSuccess: () => {
            // Invalidate both queries so player and dashboard update
            queryClient.invalidateQueries({ queryKey: ['progress'] })
            queryClient.invalidateQueries({ queryKey: ['user-progress'] })
        },
    })
}
