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

            // Get enrollments with user data
            const { data: enrollments, error } = await supabase
                .from('academy_enrollments')
                .select(`
                    id,
                    user_id,
                    course_id,
                    enrolled_at,
                    user:user_id (
                        email
                    )
                `)
                .eq('course_id', courseId)
                .order('enrolled_at', { ascending: false })

            if (error) {
                console.error('[useAdminEnrollments] Error fetching enrollments:', error)
                throw new Error(`Não foi possível carregar inscritos: ${error.message}`)
            }

            if (!enrollments) return []

            // Get lesson IDs for this course
            const { data: lessons } = await supabase
                .from('academy_lessons')
                .select('id')
                .eq('course_id', courseId)

            const lessonIds = lessons?.map(l => l.id) || []
            const totalLessons = lessonIds.length

            // Get progress for each enrollment by counting completed lessons
            const enrollmentsWithProgress = await Promise.all(
                enrollments.map(async (enrollment: any) => {
                    let progress = 0

                    if (totalLessons > 0) {
                        // Count completed lessons for this user in this course
                        const { count: completedLessons } = await supabase
                            .from('academy_lesson_progress')
                            .select('id', { count: 'exact', head: true })
                            .eq('user_id', enrollment.user_id)
                            .eq('is_completed', true)
                            .in('lesson_id', lessonIds)

                        progress = Math.round(((completedLessons || 0) / totalLessons) * 100)
                    }

                    return {
                        ...enrollment,
                        user_email: enrollment.user?.email || 'N/A',
                        progress_percentage: progress,
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
                throw new Error('Utilizador nÃ£o encontrado com este email')
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
                    throw new Error('Este utilizador jÃ¡ estÃ¡ inscrito neste curso')
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



// ============================================================
// SALES (Admin)
// ============================================================

interface SaleWithDetails {
    id: string
    course_id: string
    user_id: string
    amount_cents: number
    currency: string
    payment_method: 'cash' | 'mb' | 'transfer' | 'other'
    notes?: string
    created_at: string
    course_title?: string
    user_email?: string
}

export function useAdminSales() {
    return useQuery<SaleWithDetails[]>({
        queryKey: ['admin-sales'],
        queryFn: async () => {
            const { data: sales, error } = await supabase
                .from('academy_sales')
                .select(`
                    *,
                    course:course_id (
                        title
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            return sales || []
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
            // Get all sales with course details
            const { data: sales, error } = await supabase
                .from('academy_sales')
                .select(`
                    *,
                    course:course_id (
                        id,
                        title
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            if (!sales) return {
                total_revenue_cents: 0,
                total_sales: 0,
                average_ticket_cents: 0,
                revenue_by_period: { days_7: 0, days_30: 0, days_90: 0 },
                top_courses_by_revenue: [],
                top_courses_by_sales: []
            }

            // Calculate total revenue and sales
            const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount_cents, 0)
            const totalSales = sales.length
            const averageTicket = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0

            // Calculate revenue by period
            const now = new Date()
            const days7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            const days90Ago = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

            const revenue7Days = sales
                .filter(s => new Date(s.created_at) >= days7Ago)
                .reduce((sum, s) => sum + s.amount_cents, 0)

            const revenue30Days = sales
                .filter(s => new Date(s.created_at) >= days30Ago)
                .reduce((sum, s) => sum + s.amount_cents, 0)

            const revenue90Days = sales
                .filter(s => new Date(s.created_at) >= days90Ago)
                .reduce((sum, s) => sum + s.amount_cents, 0)

            // Group by course
            const courseStats = sales.reduce((acc: any, sale: any) => {
                const courseId = sale.course_id
                const courseTitle = sale.course?.title || 'N/A'

                if (!acc[courseId]) {
                    acc[courseId] = {
                        course_id: courseId,
                        course_title: courseTitle,
                        revenue_cents: 0,
                        sales_count: 0
                    }
                }

                acc[courseId].revenue_cents += sale.amount_cents
                acc[courseId].sales_count += 1

                return acc
            }, {})

            const courseStatsArray = Object.values(courseStats)

            // Top 5 by revenue
            const topByRevenue = [...(courseStatsArray as any[])]
                .sort((a, b) => b.revenue_cents - a.revenue_cents)
                .slice(0, 5)

            // Top 5 by sales count
            const topBySales = [...(courseStatsArray as any[])]
                .sort((a, b) => b.sales_count - a.sales_count)
                .slice(0, 5)

            return {
                total_revenue_cents: totalRevenue,
                total_sales: totalSales,
                average_ticket_cents: averageTicket,
                revenue_by_period: {
                    days_7: revenue7Days,
                    days_30: revenue30Days,
                    days_90: revenue90Days
                },
                top_courses_by_revenue: topByRevenue,
                top_courses_by_sales: topBySales
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

