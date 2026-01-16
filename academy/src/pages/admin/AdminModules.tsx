import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdminModules, useDeleteModule } from '@/hooks/useAdminCourses'
import { useCourse } from '@/hooks/useCourses'
import { Plus, Edit, Trash2, FileText, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

export default function AdminModules() {
    const { courseId } = useParams<{ courseId: string }>()
    const navigate = useNavigate()

    const { data: course, isLoading: loadingCourse } = useCourse(courseId!)
    const { data: modules, isLoading: loadingModules, isError, error } = useAdminModules(courseId!)
    const deleteMutation = useDeleteModule()

    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Tem a certeza que deseja eliminar o módulo "${title}"? Esta ação eliminará também todas as aulas deste módulo e não pode ser revertida.`)) {
            return
        }

        setDeletingId(id)
        try {
            await deleteMutation.mutateAsync(id)
        } catch (err) {
            alert('Erro ao eliminar módulo. Tente novamente.')
        } finally {
            setDeletingId(null)
        }
    }

    const isLoading = loadingCourse || loadingModules

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
                            onClick={() => navigate('/admin/courses')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar aos Cursos
                        </Button>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-display font-bold mb-2">
                                    Módulos
                                    {course && <span className="text-muted-foreground"> — {course.title}</span>}
                                </h1>
                                <p className="text-muted-foreground">
                                    Organize os módulos do curso
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate(`/admin/courses/${courseId}/modules/new`)}
                                size="lg"
                                className="gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                Novo Módulo
                            </Button>
                        </div>
                    </div>

                    {/* Error State */}
                    {isError && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Erro ao carregar módulos: {error instanceof Error ? error.message : 'Erro desconhecido'}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Modules List */}
                    {isLoading ? (
                        <SkeletonLoader variant="list" count={4} />
                    ) : modules && modules.length > 0 ? (
                        <div className="space-y-3">
                            {modules.map((module) => (
                                <Card key={module.id} className="p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        {/* Module Info */}
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                                    {module.order}
                                                </span>
                                                <h3 className="font-semibold text-lg">{module.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-11">
                                                <FileText className="h-4 w-4" />
                                                <span>{module.lessons_count || 0} aulas</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => navigate(`/admin/courses/${courseId}/modules/${module.id}`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(module.id, module.title)}
                                                disabled={deletingId === module.id}
                                            >
                                                {deletingId === module.id ? (
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
                                    <h3 className="text-xl font-semibold mb-2">Nenhum módulo criado</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Comece por criar o primeiro módulo deste curso
                                    </p>
                                    <Button onClick={() => navigate(`/admin/courses/${courseId}/modules/new`)}>
                                        Criar Primeiro Módulo
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
