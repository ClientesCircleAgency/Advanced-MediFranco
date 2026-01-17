import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdminLessons, useDeleteLesson, useAdminModules } from '@/hooks/useAdminCourses'
import { useCourse } from '@/hooks/useCourses'
import { Plus, Edit, Trash2, ArrowLeft, Loader2, AlertCircle, Video, FileText, File } from 'lucide-react'

export default function AdminLessons() {
    const { moduleId } = useParams<{ moduleId: string }>()
    const navigate = useNavigate()

    // Get module to find courseId
    const { data: modules } = useAdminModules('')
    const currentModule = modules?.find(m => m.id === moduleId)
    const courseId = currentModule?.course_id

    const { data: course } = useCourse(courseId!)
    const { data: lessons, isLoading, isError, error } = useAdminLessons(moduleId!)
    const deleteMutation = useDeleteLesson()

    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Tem a certeza que deseja eliminar a aula "${title}"? Esta ação não pode ser revertida.`)) {
            return
        }

        setDeletingId(id)
        try {
            await deleteMutation.mutateAsync(id)
        } catch (err) {
            alert('Erro ao eliminar aula. Tente novamente.')
        } finally {
            setDeletingId(null)
        }
    }

    const getIconForType = (type: string) => {
        switch (type) {
            case 'video':
                return <Video className="h-4 w-4" />
            case 'pdf':
                return <File className="h-4 w-4" />
            case 'text':
                return <FileText className="h-4 w-4" />
            default:
                return <FileText className="h-4 w-4" />
        }
    }

    const getTypeLabelshort = (type: string) => {
        switch (type) {
            case 'video':
                return 'Vídeo'
            case 'pdf':
                return 'PDF'
            case 'text':
                return 'Texto'
            default:
                return type
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 py-12 bg-muted/30">
                <div className="container max-w-5xl">
                    {/* Back Button + Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-4 gap-2"
                            onClick={() => courseId && navigate(`/admin/courses/${courseId}/modules`)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar aos Módulos
                        </Button>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-display font-bold mb-2">
                                    Aulas
                                    {currentModule && <span className="text-muted-foreground"> — {currentModule.title}</span>}
                                </h1>
                                {course && (
                                    <p className="text-muted-foreground">
                                        Curso: {course.title}
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={() => navigate(`/admin/modules/${moduleId}/lessons/new`)}
                                size="lg"
                                className="gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                Nova Aula
                            </Button>
                        </div>
                    </div>

                    {/* Error State */}
                    {isError && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Erro ao carregar aulas: {error instanceof Error ? error.message : 'Não foi possível carregar aulas. Tente recarregar a página.'}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Lessons List */}
                    {isLoading ? (
                        <SkeletonLoader variant="list" count={5} />
                    ) : lessons && lessons.length > 0 ? (
                        <div className="space-y-3">
                            {lessons.map((lesson) => (
                                <Card key={lesson.id} className="p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        {/* Lesson Info */}
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                                    {lesson.order}
                                                </span>
                                                <h3 className="font-semibold text-lg">{lesson.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-11">
                                                <div className="flex items-center gap-1">
                                                    {getIconForType(lesson.content_type)}
                                                    <span>{getTypeLabelshort(lesson.content_type)}</span>
                                                </div>
                                                {lesson.duration_minutes && (
                                                    <div className="flex items-center gap-1">
                                                        <span>⏱</span>
                                                        <span>{lesson.duration_minutes} min</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => navigate(`/admin/modules/${moduleId}/lessons/${lesson.id}`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(lesson.id, lesson.title)}
                                                disabled={deletingId === lesson.id}
                                            >
                                                {deletingId === lesson.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                    <Plus className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Nenhuma aula criada</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Comece por criar a primeira aula deste módulo
                                    </p>
                                    <Button onClick={() => navigate(`/admin/modules/${moduleId}/lessons/new`)}>
                                        Criar Primeira Aula
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
