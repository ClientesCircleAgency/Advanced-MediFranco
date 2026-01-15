import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, Module, Lesson } from '@/types'

// ============================================================
// COURSES
// ============================================================

export function useAdminCourses() {
    return useQuery({
        queryKey: ['admin-courses'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('academy_courses')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Course[]
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
