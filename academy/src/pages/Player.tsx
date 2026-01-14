import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AccessDenied } from '@/components/AccessDenied'
import { useCourse } from '@/hooks/useCourses'
import { useIsEnrolled } from '@/hooks/useEnrollments'
import { useProgress, useMarkLessonComplete } from '@/hooks/useProgress'
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import type { Lesson } from '@/types'

export default function Player() {
    const { slug } = useParams<{ slug: string }>()
    const { data: course, isLoading: courseLoading, error: courseError } = useCourse(slug!)
    const { data: isEnrolled, isLoading: enrollmentLoading } = useIsEnrolled(course?.id || '')
    const { data: progress } = useProgress(course?.id)
    const markCompleteMutation = useMarkLessonComplete()

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

    const completedLessonIds = new Set(progress?.map(p => p.lesson_id) || [])

    // Auto-select first lesson
    if (course && !selectedLesson && course.modules && course.modules.length > 0) {
        const firstLesson = course.modules[0]?.lessons?.[0]
        if (firstLesson) {
            setSelectedLesson(firstLesson)
        }
    }

    if (courseLoading || enrollmentLoading) {
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

    // Handle access denied (not enrolled or RLS blocking)
    if (!isEnrolled || courseError || (course && (!course.modules || course.modules.length === 0))) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <AccessDenied
                    title="Acesso ao Curso Restrito"
                    description="Precisa de estar inscrito neste curso para aceder às aulas."
                    courseSlug={slug}
                />
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

    const handleMarkComplete = () => {
        if (selectedLesson) {
            markCompleteMutation.mutate(selectedLesson.id)
        }
    }

    const isLessonComplete = selectedLesson ? completedLessonIds.has(selectedLesson.id) : false

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1">
                <div className="container py-6">
                    <h1 className="text-2xl font-bold mb-6">{course.title}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lesson Player */}
                        <div className="lg:col-span-2 space-y-4">
                            {selectedLesson && (
                                <>
                                    <Card className="overflow-hidden">
                                        {selectedLesson.content_type === 'video' ? (
                                            <div className="aspect-video bg-black">
                                                <iframe
                                                    src={selectedLesson.content_url}
                                                    className="w-full h-full"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-muted flex items-center justify-center">
                                                <div className="text-center">
                                                    <PlayCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                                    <p className="text-muted-foreground">
                                                        {selectedLesson.content_type === 'pdf' ? 'Documento PDF' : 'Conteúdo de Texto'}
                                                    </p>
                                                    <a
                                                        href={selectedLesson.content_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline mt-2 inline-block"
                                                    >
                                                        Abrir em Nova Janela
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </Card>

                                    <Card className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-semibold">{selectedLesson.title}</h2>
                                            <Button
                                                onClick={handleMarkComplete}
                                                disabled={isLessonComplete || markCompleteMutation.isPending}
                                                variant={isLessonComplete ? "ghost" : "default"}
                                            >
                                                {isLessonComplete ? (
                                                    <>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Concluída
                                                    </>
                                                ) : (
                                                    'Marcar como Concluída'
                                                )}
                                            </Button>
                                        </div>
                                        {selectedLesson.duration_minutes && selectedLesson.duration_minutes > 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                Duração: {selectedLesson.duration_minutes} minutos
                                            </p>
                                        )}
                                    </Card>
                                </>
                            )}
                        </div>

                        {/* Course Modules & Lessons Sidebar */}
                        <div className="space-y-4">
                            <Card className="p-4">
                                <h3 className="font-semibold mb-4">Conteúdo do Curso</h3>
                                <div className="space-y-4">
                                    {course.modules?.map((module, idx) => (
                                        <div key={module.id}>
                                            <h4 className="font-medium text-sm mb-2">
                                                Módulo {idx + 1}: {module.title}
                                            </h4>
                                            <ul className="space-y-1">
                                                {module.lessons?.map((lesson) => (
                                                    <li key={lesson.id}>
                                                        <button
                                                            onClick={() => setSelectedLesson(lesson)}
                                                            className={`w-full text-left text-sm p-2 rounded hover:bg-accent flex items-center gap-2 ${selectedLesson?.id === lesson.id ? 'bg-accent' : ''
                                                                }`}
                                                        >
                                                            {completedLessonIds.has(lesson.id) ? (
                                                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                            ) : (
                                                                <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                            )}
                                                            <span className="line-clamp-1">{lesson.title}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
