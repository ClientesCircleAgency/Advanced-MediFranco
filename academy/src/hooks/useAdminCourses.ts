import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, Module, Lesson } from '@/types'

// ============================================================
// COURSES
// ============================================================

interface CourseWithStats extends Course {
    modules_count?: number
    lessons_count?: number
    enrollments_count?: number
}

export function useAdminCourses() {
    return useQuery<CourseWithStats[]>({
        queryKey: ['admin-courses'],
        queryFn: async () => {
            // Get courses
            const { data: courses, error: coursesError } = await supabase
                .from('academy_courses')
                .select('*')
                .order('created_at', { ascending: false })

            if (coursesError) throw coursesError
            if (!courses) return []

            // Get stats for each course
            const coursesWithStats = await Promise.all(
                courses.map(async (course) => {
                    // Count modules
                    const { count: modulesCount } = await supabase
                        .from('academy_modules')
                        .select('*', { count: 'exact', head: true })
                        .eq('course_id', course.id)

                    // Count lessons
                    const { count: lessonsCount } = await supabase
                        .from('academy_lessons')
                        .select('*', { count: 'exact', head: true })
                        .in('module_id',
                            await supabase
                                .from('academy_modules')
                                .select('id')
                                .eq('course_id', course.id)
                                .then(r => r.data?.map(m => m.id) || [])
                        )

                    // Count enrollments
                    const { count: enrollmentsCount } = await supabase
                        .from('academy_enrollments')
                        .select('*', { count: 'exact', head: true })
                        .eq('course_id', course.id)

                    return {
                        ...course,
                        modules_count: modulesCount || 0,
                        lessons_count: lessonsCount || 0,
                        enrollments_count: enrollmentsCount || 0,
                    }
                })
            )

            return coursesWithStats
        },
    })
}

export function useCreateCourse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (course: Partial<Course>) => {
            const { data, error } = await supabase
                .from('academy_courses')
                .insert(course)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
        },
    })
}

export function useUpdateCourse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Course> }) => {
            const { data, error } = await supabase
                .from('academy_courses')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
        },
    })
}

export function useTogglePublished() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
            const { data, error } = await supabase
                .from('academy_courses')
                .update({ is_published: !isPublished })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
    })
}

export function useDeleteCourse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('academy_courses')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
        },
    })
}

// ============================================================
// MODULES
// ============================================================

export function useCreateModule() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (module: Partial<Module>) => {
            const { data, error } = await supabase
                .from('academy_modules')
                .insert(module)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
    })
}

export function useUpdateModule() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Module> }) => {
            const { data, error } = await supabase
                .from('academy_modules')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
    })
}

export function useDeleteModule() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('academy_modules')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
    })
}

// ============================================================
// LESSONS
// ============================================================

export function useCreateLesson() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (lesson: Partial<Lesson>) => {
            const { data, error } = await supabase
                .from('academy_lessons')
                .insert(lesson)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
    })
}

export function useUpdateLesson() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lesson> }) => {
            const { data, error } = await supabase
                .from('academy_lessons')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
    })
}

export function useDeleteLesson() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('academy_lessons')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
    })
}
