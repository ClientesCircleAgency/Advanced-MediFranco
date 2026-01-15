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
            const { data, error } = await supabase
                .rpc('get_my_course_progress')

            if (error) throw error
            return (data || []) as CourseProgress[]
        },
    })
}
