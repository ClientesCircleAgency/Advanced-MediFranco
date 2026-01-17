import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdminCourses, useDeleteCourse, useTogglePublished } from '@/hooks/useAdminCourses'
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen, FileText, Users, Loader2, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function AdminCourses() {
    const navigate = useNavigate()
    const { data: courses, isLoading, isError, error } = useAdminCourses()
    const deleteMutation = useDeleteCourse()
    const toggleMutation = useTogglePublished()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Tem a certeza que deseja eliminar "${title}"? Esta ação não pode ser revertida.`)) {
            return
        }

        setDeletingId(id)
        try {
            await deleteMutation.mutateAsync(id)
        } catch (err) {
            alert('Erro ao eliminar curso. Tente novamente.')
        } finally {
            setDeletingId(null)
        }
    }

    const handleTogglePublished = async (id: string, isPublished: boolean, title: string) => {
        setTogglingId(id)
        try {
            await toggleMutation.mutateAsync({ id, isPublished })
        } catch (err) {
            alert(`Erro ao ${isPublished ? 'despublicar' : 'publicar'} "${title}". Tente novamente.`)
        } finally {
            setTogglingId(null)
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 py-12 bg-muted/30">
                <div className="container max-w-6xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-display font-bold mb-2">Gestão de Cursos</h1>
                            <p className="text-muted-foreground">
                                Crie e gira os cursos da MediFranco Academy
                            </p>
                        </div>
                        <Button onClick={() => navigate('/admin/courses/new')} size="lg" className="gap-2">
                            <Plus className="h-5 w-5" />
                            Novo Curso
                        </Button>
                    </div>

                    {/* Error State */}
                    {isError && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Erro ao carregar cursos: {error instanceof Error ? error.message : 'Não foi possível carregar cursos. Tente recarregar a página.'}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Courses List */}
                    {isLoading ? (
                        <SkeletonLoader variant="card" count={3} />
                    ) : courses && courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    {/* Course Image */}
                                    <div className="aspect-video relative overflow-hidden bg-muted">
                                        <img
                                            src={course.image_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2">
                                            {course.is_published ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Eye className="h-3 w-3" />
                                                    Publicado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <EyeOff className="h-3 w-3" />
                                                    Rascunho
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Course Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold mb-1 line-clamp-2">{course.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {course.description}
                                        </p>
                                        <div className="text-lg font-bold text-primary mb-4">
                                            {formatPrice(course.price_cents)}
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b">
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                <span>{course.modules_count || 0} módulos</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FileText className="h-3.5 w-3.5" />
                                                <span>{course.lessons_count || 0} aulas</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{course.enrollments_count || 0}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 gap-2"
                                                onClick={() => navigate(`/admin/courses/${course.id}`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant={course.is_published ? "outline" : "default"}
                                                size="sm"
                                                onClick={() => handleTogglePublished(course.id, course.is_published, course.title)}
                                                disabled={togglingId === course.id}
                                            >
                                                {togglingId === course.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : course.is_published ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(course.id, course.title)}
                                                disabled={deletingId === course.id}
                                            >
                                                {deletingId === course.id ? (
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
                                    <h3 className="text-xl font-semibold mb-2">Nenhum curso criado</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Comece por criar o seu primeiro curso
                                    </p>
                                    <Button onClick={() => navigate('/admin/courses/new')}>
                                        Criar Primeiro Curso
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
