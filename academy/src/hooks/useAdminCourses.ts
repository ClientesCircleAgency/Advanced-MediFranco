import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, Module, Lesson, Enrollment } from '@/types'

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

interface ModuleWithStats extends Module {
    lessons_count?: number
}

export function useAdminModules(courseId: string) {
    return useQuery<ModuleWithStats[]>({
        queryKey: ['admin-modules', courseId],
        queryFn: async () => {
            // Get modules
            const { data: modules, error: modulesError } = await supabase
                .from('academy_modules')
                .select('*')
                .eq('course_id', courseId)
                .order('order', { ascending: true })

            if (modulesError) throw modulesError
            if (!modules) return []

            // Get lesson counts for each module
            const modulesWithStats = await Promise.all(
                modules.map(async (module) => {
                    const { count: lessonsCount } = await supabase
                        .from('academy_lessons')
                        .select('*', { count: 'exact', head: true })
                        .eq('module_id', module.id)

                    return {
                        ...module,
                        lessons_count: lessonsCount || 0,
                    }
                })
            )

            return modulesWithStats
        },
        enabled: !!courseId,
    })
}

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
            queryClient.invalidateQueries({ queryKey: ['admin-modules'] })
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
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
            queryClient.invalidateQueries({ queryKey: ['admin-modules'] })
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
            queryClient.invalidateQueries({ queryKey: ['admin-modules'] })
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
        },
    })
}

// ============================================================
// LESSONS
// ============================================================

export function useAdminLessons(moduleId: string) {
    return useQuery<Lesson[]>({
        queryKey: ['admin-lessons', moduleId],
        queryFn: async () => {
            const { data: lessons, error } = await supabase
                .from('academy_lessons')
                .select('*')
                .eq('module_id', moduleId)
                .order('order', { ascending: true })

            if (error) throw error
            return lessons || []
        },
        enabled: !!moduleId,
    })
}

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
            queryClient.invalidateQueries({ queryKey: ['admin-modules'] })
            queryClient.invalidateQueries({ queryKey: ['admin-lessons'] })
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
            queryClient.invalidateQueries({ queryKey: ['admin-modules'] })
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
            queryClient.invalidateQueries({ queryKey: ['admin-modules'] })
        },
    })
}

// ============================================================
// ENROLLMENTS (Admin)
// ============================================================

interface EnrollmentWithUser extends Enrollment {
    user_email?: string
    user_name?: string
    progress_percentage?: number
}

export function useAdminEnrollments(courseId: string) {
    return useQuery<EnrollmentWithUser[]>({
        queryKey: ['admin-enrollments', courseId],
        queryFn: async () => {
            // Get enrollments with user data
            const { data: enrollments, error } = await supabase
                .from('academy_enrollments')
                .select(`
                    *,
                    user:user_id (
                        email
                    )
                `)
                .eq('course_id', courseId)
                .order('enrolled_at', { ascending: false })

            if (error) throw error
            if (!enrollments) return []

            // Get progress for each enrollment
            const enrollmentsWithProgress = await Promise.all(
                enrollments.map(async (enrollment: any) => {
                    // Get user's progress using RPC function
                    const { data: progressData } = await supabase
                        .rpc('get_my_course_progress')
                        .eq('course_id', courseId)
                        .eq('user_id', enrollment.user_id)
                        .single()

                    return {
                        ...enrollment,
                        user_email: enrollment.user?.email || 'N/A',
                        progress_percentage: (progressData as any)?.progress_percentage || 0,
                    }
                })
            )

            return enrollmentsWithProgress
        },
        enabled: !!courseId,
    })
}

export function useCreateEnrollment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ courseId, userEmail }: { courseId: string; userEmail: string }) => {
            // First, find user by email
            const { data: users, error: userError } = await supabase
                .from('auth.users')
                .select('id, email')
                .eq('email', userEmail)
                .single()

            // If direct query doesn't work, try RPC approach or just use email
            // For now, we'll create enrollment with email as reference
            // The actual user_id will be validated by RLS

            if (userError || !users) {
                throw new Error('Utilizador não encontrado com este email')
            }

            // Create enrollment
            const { data, error } = await supabase
                .from('academy_enrollments')
                .insert({
                    course_id: courseId,
                    user_id: users.id,
                })
                .select()
                .single()

            if (error) {
                if (error.code === '23505') {
                    throw new Error('Este utilizador já está inscrito neste curso')
                }
                throw error
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
        },
    })
}

export function useDeleteEnrollment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (enrollmentId: string) => {
            const { error } = await supabase
                .from('academy_enrollments')
                .delete()
                .eq('id', enrollmentId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
        },
    })
}

