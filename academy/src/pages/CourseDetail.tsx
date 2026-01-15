import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCourse } from '@/hooks/useCourses'
import { useIsEnrolled, useEnroll } from '@/hooks/useEnrollments'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/lib/utils'
import { Clock, BookOpen, CheckCircle2, Loader2 } from 'lucide-react'
import { mockCheckout } from '@/lib/stubs'

export default function CourseDetail() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: course, isLoading } = useCourse(slug!)
    const { data: isEnrolled } = useIsEnrolled(course?.id || '')
    const enrollMutation = useEnroll()

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: `/courses/${slug}` } } })
            return
        }

        if (!course) return

        try {
            // Mock checkout
            const { success } = await mockCheckout(course.id, user.id)
            if (success) {
                await enrollMutation.mutateAsync(course.id)
                navigate('/dashboard?enrolled=true')
            }
        } catch (error) {
            console.error('Enrollment error:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <Footer />
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Curso não encontrado</h1>
                        <p className="text-muted-foreground">O curso que procura não existe.</p>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0
    const totalDuration = course.modules?.reduce(
        (acc, mod) => acc + (mod.lessons?.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0) || 0),
        0
    ) || 0

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1">
                {/* Hero with brand gradient */}
                <section className="bg-primary-gradient py-12">
                    <div className="container">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div className="text-white">
                                <h1 className="text-4xl font-display font-bold mb-4 animate-fade-in-up">{course.title}</h1>
                                <p className="text-lg text-white/90 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>{course.description}</p>

                                <div className="flex items-center gap-6 mb-6 text-white/90 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        <span>{totalLessons} aulas</span>
                                    </div>
                                    {totalDuration > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            <span>{Math.ceil(totalDuration / 60)}h de conteúdo</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                    <div className="text-3xl font-bold text-white">{formatPrice(course.price_cents)}</div>
                                    {isEnrolled ? (
                                        <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl" onClick={() => navigate('/dashboard')}>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Ir para o Curso
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="bg-white text-primary hover:bg-white/90 shadow-xl"
                                            onClick={handleEnroll}
                                            disabled={enrollMutation.isPending}
                                        >
                                            {enrollMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Inscrever-me
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="aspect-video rounded-lg overflow-hidden shadow-2xl border-4 border-white/20 animate-scale-in">
                                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Course Content */}
                <section className="py-12">
                    <div className="container max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6">Conteúdo do Curso</h2>
                        <div className="space-y-4">
                            {course.modules?.map((module, idx) => (
                                <Card key={module.id} className="p-6">
                                    <h3 className="font-semibold text-lg mb-4">
                                        Módulo {idx + 1}: {module.title}
                                    </h3>
                                    <ul className="space-y-2">
                                        {module.lessons?.map((lesson) => (
                                            <li key={lesson.id} className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                                <span>{lesson.title}</span>
                                                {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                                                    <span className="text-muted-foreground ml-auto">{lesson.duration_minutes} min</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
