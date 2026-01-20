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
 * Calculates real progress based on completed lessons vs total lessons
 */
export function useUserProgress() {
    return useQuery({
        queryKey: ['user-progress'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            // Get enrollments with course data
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

            // For each course, fetch lesson count and progress
            const progressPromises = publishedEnrollments.map(async (enrollment: any) => {
                const courseId = enrollment.academy_courses.id

                // Count total lessons in course
                const { count: totalLessons } = await supabase
                    .from('academy_lessons')
                    .select('*', { count: 'exact', head: true })
                    .eq('course_id', courseId)

                // Count completed lessons for this user
                const { count: completedLessons } = await supabase
                    .from('academy_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('course_id', courseId)
                    .not('completed_at', 'is', null)

                const total = totalLessons || 0
                const completed = completedLessons || 0
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

                return {
                    course_id: enrollment.academy_courses.id,
                    course_title: enrollment.academy_courses.title,
                    course_slug: enrollment.academy_courses.slug,
                    course_image_url: enrollment.academy_courses.image_url,
                    total_lessons: total,
                    completed_lessons: completed,
                    progress_percentage: percentage
                }
            })

            const coursesWithProgress = await Promise.all(progressPromises)
            return coursesWithProgress as CourseProgress[]
        },
    })
}
