import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AccessDenied } from '@/components/AccessDenied'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { LessonItem } from '@/components/ui/LessonItem'
import { CourseProgress } from '@/components/ui/CourseProgress'
import { useCourse } from '@/hooks/useCourses'
import { useIsEnrolled } from '@/hooks/useEnrollments'
import { useProgress, useMarkLessonComplete } from '@/hooks/useProgress'
import { CheckCircle2, FileText } from 'lucide-react'
import type { Lesson } from '@/types'

export default function Player() {
    const { slug } = useParams<{ slug: string }>()
    const { data: course, isLoading: courseLoading, error: courseError } = useCourse(slug!)
    const { data: isEnrolled, isLoading: enrollmentLoading } = useIsEnrolled(course?.id || '')
    const { data: progress } = useProgress(course?.id)
    const markCompleteMutation = useMarkLessonComplete()

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

    const completedLessonIds = new Set(progress?.map(p => p.lesson_id) || [])
    const totalLessons = course?.modules?.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0) || 0
    const completedCount = progress?.length || 0
    const percentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

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
                <main className="flex-1 py-6">
                    <div className="container">
                        <SkeletonLoader variant="player" count={1} />
                    </div>
                </main>
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

            {/* Progress Bar */}
            <div className="border-b bg-card">
                <div className="container py-3">
                    <CourseProgress
                        completed={completedCount}
                        total={totalLessons}
                        percentage={percentage}
                        showText={false}
                    />
                </div>
            </div>

            <main className="flex-1 py-6">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Player + Tabs */}
                        <div className="lg:col-span-2 space-y-6">
                            {selectedLesson && (
                                <>
                                    {/* Video Player */}
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
                                                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                                    <p className="text-muted-foreground mb-2">
                                                        {selectedLesson.content_type === 'pdf' ? 'Documento PDF' : 'Conteúdo de Texto'}
                                                    </p>
                                                    <a
                                                        href={selectedLesson.content_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline text-sm"
                                                    >
                                                        Abrir em Nova Janela
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </Card>

                                    {/* Lesson Info + Mark Complete */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h1 className="text-2xl font-semibold mb-1">{selectedLesson.title}</h1>
                                            {selectedLesson.duration_minutes && selectedLesson.duration_minutes > 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    Duração: {selectedLesson.duration_minutes} minutos
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            onClick={handleMarkComplete}
                                            disabled={isLessonComplete || markCompleteMutation.isPending}
                                            variant={isLessonComplete ? "ghost" : "default"}
                                            className="flex-shrink-0"
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

                                    {/* Tabs - Description / Materials / Notes */}
                                    <Tabs defaultValue="description" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="description">Descrição</TabsTrigger>
                                            <TabsTrigger value="materials">Materiais</TabsTrigger>
                                            <TabsTrigger value="notes">Notas</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="description" className="py-4">
                                            <div className="prose prose-sm max-w-none">
                                                <p className="text-muted-foreground">
                                                    {selectedLesson.title}
                                                </p>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="materials" className="py-4">
                                            <p className="text-sm text-muted-foreground">
                                                Não há materiais disponíveis para esta aula.
                                            </p>
                                        </TabsContent>
                                        <TabsContent value="notes" className="py-4">
                                            <p className="text-sm text-muted-foreground">
                                                As suas notas aparecerão aqui. (Funcionalidade em desenvolvimento)
                                            </p>
                                        </TabsContent>
                                    </Tabs>
                                </>
                            )}
                        </div>

                        {/* Right Column - Compact Playlist */}
                        <div className="lg:col-span-1">
                            <Card className="p-4 sticky top-6">
                                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                                    Conteúdo do Curso
                                </h3>
                                <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                                    {course.modules?.map((module, idx) => (
                                        <div key={module.id}>
                                            <h4 className="font-medium text-sm mb-2 text-foreground/80">
                                                Módulo {idx + 1}: {module.title}
                                            </h4>
                                            <div className="space-y-1">
                                                {module.lessons?.map((lesson) => (
                                                    <LessonItem
                                                        key={lesson.id}
                                                        title={lesson.title}
                                                        duration={lesson.duration_minutes}
                                                        contentType={lesson.content_type}
                                                        isCompleted={completedLessonIds.has(lesson.id)}
                                                        isActive={selectedLesson?.id === lesson.id}
                                                        onClick={() => setSelectedLesson(lesson)}
                                                    />
                                                ))}
                                            </div>
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
