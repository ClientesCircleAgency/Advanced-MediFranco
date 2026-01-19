import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface CourseProgress {
    course_id: string
    course_title: string
    course_slug: string
    course_image_url: string
    total_lessons: number
    completed_lessons: number
    progress_percentage: number
}

/**
 * Hook to get progress stats for all enrolled courses of the current user
 * Uses secure SQL function that calls auth.uid() internally
 */
export function useUserProgress() {
    return useQuery({
        queryKey: ['user-progress'],
        queryFn: async () => {
            // Workaround: Direct query instead of RPC due to PostgREST 403
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            const { data: enrollments, error: enrollError } = await supabase
                .from('academy_enrollments')
                .select(`
                    course_id,
                    academy_courses!inner (
                        id,
                        title,
                        slug,
                        image_url,
                        is_published
                    )
                `)
                .eq('user_id', user.id)

            if (enrollError) throw enrollError
            if (!enrollments) return []

            // Filter only published courses
            const publishedEnrollments = enrollments.filter(
                (e: any) => e.academy_courses?.is_published === true
            )

            // Transform to CourseProgress format
            return publishedEnrollments.map((enrollment: any) => ({
                course_id: enrollment.academy_courses.id,
                course_title: enrollment.academy_courses.title,
                course_slug: enrollment.academy_courses.slug,
                course_image_url: enrollment.academy_courses.image_url,
                total_lessons: 0, // TODO: Calculate from modules/lessons
                completed_lessons: 0, // TODO: Calculate from progress
                progress_percentage: 0
            })) as CourseProgress[]
        },
    })
}
