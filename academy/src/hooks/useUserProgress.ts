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

                // Count total lessons in course (via modules)
                const { data: lessons, error: lessonsError } = await supabase
                    .from('academy_lessons')
                    .select('id, academy_modules!inner(course_id)')
                    .eq('academy_modules.course_id', courseId)

                if (lessonsError) {
                    console.error('Error fetching lessons:', lessonsError)
                }

                const totalLessons = lessons?.length || 0

                // Count completed lessons for this user in this course
                const { data: completedProgress, error: progressError } = await supabase
                    .from('academy_progress')
                    .select('lesson_id')
                    .eq('user_id', user.id)
                    .not('completed_at', 'is', null)

                if (progressError) {
                    console.error('Error fetching progress:', progressError)
                }

                // Filter completed lessons that belong to this course
                const lessonIds = lessons?.map(l => l.id) || []
                const completedInThisCourse = completedProgress?.filter(
                    p => lessonIds.includes(p.lesson_id)
                ) || []

                const completedLessons = completedInThisCourse.length
                const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

                return {
                    course_id: enrollment.academy_courses.id,
                    course_title: enrollment.academy_courses.title,
                    course_slug: enrollment.academy_courses.slug,
                    course_image_url: enrollment.academy_courses.image_url,
                    total_lessons: totalLessons,
                    completed_lessons: completedLessons,
                    progress_percentage: percentage
                }
            })

            const coursesWithProgress = await Promise.all(progressPromises)
            return coursesWithProgress as CourseProgress[]
        },
    })
}
