import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { AccessDenied } from '@/components/AccessDenied'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { LessonItem } from '@/components/ui/LessonItem'
import { useCourse } from '@/hooks/useCourses'
import { useIsEnrolled, useEnroll } from '@/hooks/useEnrollments'
import { useAuth } from '@/contexts/AuthContext'
import { redirectToCheckout } from '@/lib/stripe'
import { BookOpen, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function CourseDetail() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const { data: course, isLoading: courseLoading } = useCourse(slug!)
    const { user } = useAuth()
    const { data: isEnrolled, isLoading: enrollmentLoading } = useIsEnrolled(course?.id || '')
    const enrollMutation = useEnroll()
    const [checkoutLoading, setCheckoutLoading] = useState(false)

    const totalLessons = course?.modules?.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0) || 0
    const totalDuration = course?.modules?.reduce(
        (sum, mod) => sum + (mod.lessons?.reduce((s, lesson) => s + (lesson.duration_minutes || 0), 0) || 0),
        0
    ) || 0

    const handleEnroll = async () => {
        if (!course || !user) {
            navigate('/login')
            return
        }

        // Free courses: enroll directly
        if (course.price_cents === 0) {
            await enrollMutation.mutateAsync(course.id)
            navigate('/checkout/success?courseId=' + course.id)
            return
        }

        // Paid courses: Stripe checkout (or mock)
        setCheckoutLoading(true)
        const result = await redirectToCheckout(course.id, user.id, course.title, course.price_cents)
        setCheckoutLoading(false)

        if (result.redirectUrl) {
            navigate(result.redirectUrl)
        }
    }

    if (courseLoading || enrollmentLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 py-12">
                    <div className="container max-w-5xl">
                        <SkeletonLoader variant="player" count={1} />
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <AccessDenied
                    title="Curso Não Encontrado"
                    description="O curso que procura não existe ou não está disponível."
                />
                <Footer />
            </div>
        )
    }

    const courseJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.description,
        provider: {
            '@type': 'Organization',
            name: 'MediFranco Academy',
            sameAs: 'https://medifranco.pt',
        },
        offers: {
            '@type': 'Offer',
            price: (course.price_cents / 100).toFixed(2),
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
        },
    }

    return (
        <div className="flex flex-col min-h-screen">
            <SEO
                title={course.title}
                description={course.description?.slice(0, 155) || `Curso online: ${course.title}`}
                path={`/courses/${slug}`}
                jsonLd={courseJsonLd}
            />
            <Header />

            <main className="flex-1">
                {/* Compact Hero */}
                <section className="bg-primary-gradient py-12">
                    <div className="container max-w-5xl">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2 text-white">
                                <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{course.title}</h1>
                                <p className="text-lg text-white/90 mb-6">{course.description}</p>

                                <div className="flex items-center gap-6 text-sm text-white/90 mb-6">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{totalLessons} aulas</span>
                                    </div>
                                    {totalDuration > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{Math.ceil(totalDuration / 60)}h de conteúdo</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-2xl font-bold text-white">{formatPrice(course.price_cents)}</div>
                                    {isEnrolled ? (
                                        <Button
                                            size="lg"
                                            className="bg-white text-primary hover:bg-white/90 shadow-xl gap-2"
                                            onClick={() => navigate(`/courses/${slug}/player`)}
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                            Ir para o Curso
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="bg-white text-primary hover:bg-white/90 shadow-xl"
                                            onClick={handleEnroll}
                                            disabled={enrollMutation.isPending || checkoutLoading}
                                        >
                                            {(enrollMutation.isPending || checkoutLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {course.price_cents === 0 ? 'Inscrever-me Grátis' : `Comprar — ${formatPrice(course.price_cents)}`}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="aspect-video rounded-lg overflow-hidden shadow-2xl border-4 border-white/20">
                                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Course Content - Collapsible Modules */}
                <section className="py-12">
                    <div className="container max-w-3xl">
                        <h2 className="text-2xl font-semibold mb-6">Conteúdo Programático</h2>

                        <Accordion type="multiple" defaultValue={course.modules?.map(m => m.id) || []} className="space-y-2">
                            {course.modules?.map((module, idx) => (
                                <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-3 text-left">
                                            <span className="font-semibold">
                                                Módulo {idx + 1}: {module.title}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                ({module.lessons?.length || 0} aulas)
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-1 pt-2">
                                            {module.lessons?.map((lesson) => (
                                                <LessonItem
                                                    key={lesson.id}
                                                    title={lesson.title}
                                                    duration={lesson.duration_minutes}
                                                    contentType={lesson.content_type}
                                                    isCompleted={false}
                                                    onClick={() => { }}
                                                />
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
