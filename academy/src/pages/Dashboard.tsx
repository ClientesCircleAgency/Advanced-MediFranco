import { Link } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CourseProgress } from '@/components/ui/CourseProgress'
import { CertificateCard } from '@/components/CertificateCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { useUserProgress } from '@/hooks/useUserProgress'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, ArrowRight } from 'lucide-react'

export default function Dashboard() {
    const { user } = useAuth()
    const { data: progressData, isLoading } = useUserProgress()
    const studentName = user?.user_metadata?.name || user?.email || 'Aluno'

    return (
        <div className="flex flex-col min-h-screen">
            <SEO
                title="Os Meus Cursos"
                description="Aceda aos seus cursos e acompanhe o seu progresso na MediFranco Academy."
                path="/cursos"
            />
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
                    ) : progressData && progressData.length > 0 ? (
                        <div className="space-y-6">
                            {progressData.map((course: any) => (
                                <Card key={course.course_id} className="p-6 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Course Image */}
                                        <div className="w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={course.course_image_url}
                                                alt={course.course_title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Course Info */}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-xl font-semibold mb-2 line-clamp-2">{course.course_title}</h2>

                                            <CourseProgress
                                                completed={course.completed_lessons}
                                                total={course.total_lessons}
                                                percentage={course.progress_percentage}
                                                className="mb-4"
                                            />

                                            {course.progress_percentage === 100 && (
                                                <div className="mb-3">
                                                    <CertificateCard
                                                        studentName={studentName}
                                                        courseName={course.course_title}
                                                        completionDate={new Date().toLocaleDateString('pt-PT')}
                                                    />
                                                </div>
                                            )}

                                            <Link to={`/courses/${course.course_slug}/player`}>
                                                <Button className="gap-2 w-full md:w-auto" variant={course.progress_percentage === 100 ? 'outline' : 'default'}>
                                                    {course.progress_percentage === 0
                                                        ? 'Começar'
                                                        : course.progress_percentage === 100
                                                            ? 'Rever Curso'
                                                            : 'Continuar'}
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            ))}
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
