import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/CourseCard'
import { useCourses } from '@/hooks/useCourses'
import { useEnrollments } from '@/hooks/useEnrollments'

export default function Catalog() {
    const { data: courses, isLoading } = useCourses()
    const { data: enrollments } = useEnrollments()

    const enrolledCourseIds = new Set(enrollments?.map(e => e.course_id) || [])

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 py-12">
                <div className="container">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-4">Catálogo de Cursos</h1>
                        <p className="text-lg text-muted-foreground">
                            Explore todos os cursos disponíveis na MediFranco Academy
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : courses && courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    enrolled={enrolledCourseIds.has(course.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Nenhum curso disponível no momento.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
