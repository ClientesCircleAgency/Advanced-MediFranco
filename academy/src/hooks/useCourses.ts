import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/types'

export function useCourses() {
    return useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('academy_courses')
                .select(`
          *,
          modules:academy_modules(
            *,
            lessons:academy_lessons(*)
          )
        `)
                .eq('is_published', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return (data as Course[]) || []
        },
    })
}

export function useCourse(slug: string) {
    return useQuery({
        queryKey: ['course', slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('academy_courses')
                .select(`
          *,
          modules:academy_modules(
            *,
            lessons:academy_lessons(*)
          )
        `)
                .eq('slug', slug)
                .eq('is_published', true)
                .single()

            if (error) throw error

            // Sort modules and lessons by order
            if (data.modules) {
                data.modules.sort((a: any, b: any) => a.order - b.order)
                data.modules.forEach((module: any) => {
                    if (module.lessons) {
                        module.lessons.sort((a: any, b: any) => a.order - b.order)
                    }
                })
            }

            return data as Course
        },
        enabled: !!slug,
    })
}
