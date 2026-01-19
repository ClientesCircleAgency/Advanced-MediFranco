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
            if (!courseId) return []

            // Use RPC to fetch enrollments (SECURITY DEFINER allows join with auth.users)
            const { data, error } = await supabase
                .rpc('admin_list_enrollments', { p_course_id: courseId })

            if (error) {
                console.error('[useAdminEnrollments] RPC error:', error)
                throw new Error(`Não foi possível carregar inscritos: ${error.message}`)
            }

            // Map RPC result to expected format
            const enrollments = (data || []).map((row: any) => ({
                id: row.enrollment_id,
                user_id: row.user_id,
                course_id: courseId,
                enrolled_at: row.created_at,
                user_email: row.user_email,
                progress_percentage: Number(row.progress_percentage)
            }))

            return enrollments
        },
        enabled: !!courseId,
    })
}

export function useCreateEnrollment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ courseId, userEmail }: { courseId: string; userEmail: string }) => {
            // Use new sales-first RPC (creates sale → enrollment via trigger)
            const { data, error } = await supabase
                .rpc('admin_create_sale_and_enrollment', {
                    p_course_id: courseId,
                    p_email: userEmail.trim()
                })
                .single()

            if (error) {
                // Map specific error codes to user-friendly messages
                if (error.message?.includes('user_not_found')) {
                    throw new Error('Utilizador não existe — peça para criar conta primeiro')
                }
                if (error.message?.includes('not_admin')) {
                    throw new Error('Apenas administradores podem inscrever utilizadores')
                }
                throw new Error(`Não foi possível inscrever: ${error.message}`)
            }

            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
            queryClient.invalidateQueries({ queryKey: ['admin-sales'] }) // Invalidate sales too
        },
    })
}

export function useDeleteEnrollment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (enrollmentId: string) => {
            // Sales-first architecture: Delete sale → enrollment CASCADE deleted
            // First, get the sale_id from the enrollment
            const { data: enrollment, error: fetchError } = await supabase
                .from('academy_enrollments')
                .select('sale_id')
                .eq('id', enrollmentId)
                .single()

            if (fetchError) throw fetchError
            if (!enrollment?.sale_id) {
                throw new Error('Enrollment has no associated sale')
            }

            // Delete the sale (enrollment will be CASCADE deleted)
            const { error: deleteError } = await supabase
                .from('academy_sales')
                .delete()
                .eq('id', enrollment.sale_id)

            if (deleteError) throw deleteError
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
            queryClient.invalidateQueries({ queryKey: ['admin-sales'] })
        },
    })
}



// ============================================================
// SALES (Admin)
// ============================================================

interface SaleWithDetails {
    sale_id: string
    created_at: string
    amount_cents: number
    currency: string
    payment_method: string
    course_id: string
    course_title: string
    buyer_email: string
    notes?: string
}

export function useAdminSales() {
    return useQuery<SaleWithDetails[]>({
        queryKey: ['admin-sales'],
        queryFn: async () => {
            // Use RPC to fetch sales (SECURITY DEFINER allows join with auth.users)
            const { data, error } = await supabase
                .rpc('admin_list_sales', { p_days: 90 }) // Get last 90 days

            if (error) {
                console.error('[useAdminSales] RPC error:', error)
                throw new Error(`Não foi possível carregar vendas: ${error.message}`)
            }

            return data || []
        },
    })
}

export function useCreateSale() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ courseId, userEmail, amountCents, paymentMethod, notes }: {
            courseId: string
            userEmail: string
            amountCents: number
            paymentMethod: 'cash' | 'mb' | 'transfer' | 'other'
            notes?: string
        }) => {
            // 1. Find user by email using RPC
            const { data: userId, error: userError } = await supabase
                .rpc('find_user_by_email', { p_email: userEmail })
                .single()

            if (userError || !userId) {
                throw new Error('Utilizador não encontrado com este email')
            }

            // 2. Create sale record
            const { data: sale, error: saleError } = await supabase
                .from('academy_sales')
                .insert({
                    course_id: courseId,
                    user_id: userId,
                    amount_cents: amountCents,
                    currency: 'EUR',
                    payment_method: paymentMethod,
                    notes: notes || null,
                })
                .select()
                .single()

            if (saleError) throw saleError

            // 3. Check if enrollment exists
            const { data: existingEnrollment } = await supabase
                .from('academy_enrollments')
                .select('id')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .maybeSingle()

            // 4. Create enrollment if it doesn't exist
            if (!existingEnrollment) {
                const { error: enrollError } = await supabase
                    .from('academy_enrollments')
                    .insert({
                        user_id: userId,
                        course_id: courseId,
                    })

                if (enrollError) {
                    console.error('Error creating enrollment:', enrollError)
                    // Don't throw - sale is already created
                }
            }

            return sale
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sales'] })
            queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
        },
    })
}

// Sales Analytics
interface SalesAnalytics {
    total_revenue_cents: number
    total_sales: number
    average_ticket_cents: number
    revenue_by_period: {
        days_7: number
        days_30: number
        days_90: number
    }
    top_courses_by_revenue: Array<{ course_id: string; course_title: string; revenue_cents: number; sales_count: number }>
    top_courses_by_sales: Array<{ course_id: string; course_title: string; sales_count: number; revenue_cents: number }>
}

export function useSalesAnalytics() {
    return useQuery<SalesAnalytics>({
        queryKey: ['sales-analytics'],
        queryFn: async () => {
            // Use RPC to fetch analytics (SECURITY DEFINER, calculated server-side)
            const { data, error } = await supabase
                .rpc('admin_sales_analytics', { p_days: 30 })

            if (error) {
                console.error('[useSalesAnalytics] RPC error:', error)
                // Return zeros on error instead of throwing
                return {
                    total_revenue_cents: 0,
                    total_sales: 0,
                    average_ticket_cents: 0,
                    revenue_by_period: { days_7: 0, days_30: 0, days_90: 0 },
                    top_courses_by_revenue: [],
                    top_courses_by_sales: []
                }
            }

            if (!data) {
                return {
                    total_revenue_cents: 0,
                    total_sales: 0,
                    average_ticket_cents: 0,
                    revenue_by_period: { days_7: 0, days_30: 0, days_90: 0 },
                    top_courses_by_revenue: [],
                    top_courses_by_sales: []
                }
            }

            // Map RPC JSON result to expected format
            return {
                total_revenue_cents: data.total_revenue_cents || 0,
                total_sales: data.total_sales_count || 0,
                average_ticket_cents: data.avg_ticket_cents || 0,
                revenue_by_period: {
                    days_7: 0, // RPC only returns single period
                    days_30: data.total_revenue_cents || 0,
                    days_90: 0
                },
                top_courses_by_revenue: data.top_courses || [],
                top_courses_by_sales: data.top_courses || []
            }
        },
    })
}


// ============================================================
// DASHBOARD STATS
// ============================================================

interface DashboardStats {
    total_courses: number
    published_courses: number
    draft_courses: number
    total_students: number
    total_sales: number
    total_revenue_cents: number
}

export function useAdminDashboardStats() {
    return useQuery<DashboardStats>({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            // Get courses count
            const { count: totalCourses } = await supabase
                .from('academy_courses')
                .select('*', { count: 'exact', head: true })

            const { count: publishedCourses } = await supabase
                .from('academy_courses')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true)

            // Get unique students (distinct user_ids in enrollments)
            const { data: enrollments } = await supabase
                .from('academy_enrollments')
                .select('user_id')

            const uniqueStudents = new Set(enrollments?.map(e => e.user_id) || []).size

            // Get sales count and revenue
            const { data: sales } = await supabase
                .from('academy_sales')
                .select('amount_cents')

            const totalSales = sales?.length || 0
            const totalRevenue = sales?.reduce((sum, s) => sum + s.amount_cents, 0) || 0

            return {
                total_courses: totalCourses || 0,
                published_courses: publishedCourses || 0,
                draft_courses: (totalCourses || 0) - (publishedCourses || 0),
                total_students: uniqueStudents,
                total_sales: totalSales,
                total_revenue_cents: totalRevenue,
            }
        },
    })
}

