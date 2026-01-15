import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CourseProgress } from '@/components/ui/CourseProgress'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { useEnrollments } from '@/hooks/useEnrollments'
import { useProgress } from '@/hooks/useProgress'
import { BookOpen, ArrowRight } from 'lucide-react'
import type { Course } from '@/types'

export default function Dashboard() {
    const { data: enrollments, isLoading } = useEnrollments()

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 py-12">
                <div className="container max-w-4xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-display font-bold mb-2">Meus Cursos</h1>
                        <p className="text-muted-foreground">
                            Continue a sua jornada de aprendizagem
                        </p>
                    </div>

                    {isLoading ? (
                        <SkeletonLoader variant="card" count={2} />
                    ) : enrollments && enrollments.length > 0 ? (
                        <div className="space-y-6">
                            {enrollments.map((enrollment) => {
                                if (!enrollment.course) return null
                                return (
                                    <EnrolledCourseCard
                                        key={enrollment.id}
                                        course={enrollment.course}
                                    />
                                )
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            icon={BookOpen}
                            title="Ainda não tem cursos"
                            description="Explore o nosso catálogo e inscreva-se no seu primeiro curso para começar a aprender."
                            action={{
                                label: 'Explorar Cursos',
                                href: '/catalog'
                            }}
                        />
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}

function EnrolledCourseCard({ course }: { course: Course }) {
    const { data: progress } = useProgress(course.id)

    const totalLessons = course.modules?.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0) || 0
    const completedLessons = progress?.length || 0
    const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

    return (
        <Card className="p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Course Image */}
                <div className="w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                    <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">{course.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.description}
                    </p>

                    <CourseProgress
                        completed={completedLessons}
                        total={totalLessons}
                        percentage={percentage}
                        className="mb-4"
                    />

                    <Link to={`/courses/${course.slug}/player`}>
                        <Button className="gap-2 w-full md:w-auto">
                            {percentage > 0 ? 'Continuar' : 'Começar'}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    )
}
