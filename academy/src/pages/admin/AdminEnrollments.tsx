import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdminEnrollments, useCreateEnrollment, useDeleteEnrollment } from '@/hooks/useAdminCourses'
import { useCourse } from '@/hooks/useCourses'
import { Plus, Trash2, ArrowLeft, Loader2, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react'

export default function AdminEnrollments() {
    const { courseId } = useParams<{ courseId: string }>()
    const navigate = useNavigate()

    const { data: course } = useCourse(courseId!)
    const { data: enrollments, isLoading, isError, error } = useAdminEnrollments(courseId!)
    const createMutation = useCreateEnrollment()
    const deleteMutation = useDeleteEnrollment()

    const [showAddForm, setShowAddForm] = useState(false)
    const [userEmail, setUserEmail] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleAddEnrollment = async (e: React.FormEvent) => {
        e.preventDefault()
        setSuccessMessage('')
        setErrorMessage('')

        if (!userEmail.trim()) {
            setErrorMessage('O email é obrigatório')
            return
        }

        try {
            await createMutation.mutateAsync({ courseId: courseId!, userEmail: userEmail.trim() })
            setSuccessMessage('Utilizador inscrito com sucesso!')
            setUserEmail('')
            setShowAddForm(false)
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (err: any) {
            setErrorMessage(err.message || 'Erro ao inscrever utilizador')
        }
    }

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Tem a certeza que deseja remover o acesso de "${email}" a este curso? O utilizador não será eliminado, apenas o seu acesso ao curso.`)) {
            return
        }

        setDeletingId(id)
        try {
            await deleteMutation.mutateAsync(id)
        } catch (err) {
            alert('Erro ao remover acesso. Tente novamente.')
        } finally {
            setDeletingId(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
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
                            onClick={() => navigate('/admin/courses')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar aos Cursos
                        </Button>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-display font-bold mb-2">
                                    Inscritos
                                    {course && <span className="text-muted-foreground"> — {course.title}</span>}
                                </h1>
                                <p className="text-muted-foreground">
                                    Gerir utilizadores inscritos neste curso
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowAddForm(!showAddForm)}
                                size="lg"
                                className="gap-2"
                                variant={showAddForm ? "outline" : "default"}
                            >
                                {showAddForm ? <ArrowLeft className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                                {showAddForm ? 'Cancelar' : 'Inscrever Utilizador'}
                            </Button>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <Alert variant="success" className="mb-6">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {(errorMessage || isError) && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {errorMessage || (error instanceof Error ? error.message : 'Erro desconhecido')}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Add Enrollment Form */}
                    {showAddForm && (
                        <Card className="p-6 mb-6">
                            <form onSubmit={handleAddEnrollment} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="userEmail">Email do Utilizador *</Label>
                                    <Input
                                        id="userEmail"
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        placeholder="exemplo@email.com"
                                        required
                                        disabled={createMutation.isPending}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        O utilizador deve estar registado na plataforma
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="gap-2"
                                    >
                                        {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                        <Plus className="h-4 w-4" />
                                        Inscrever
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddForm(false)
                                            setUserEmail('')
                                            setErrorMessage('')
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* Enrollments List */}
                    {isLoading ? (
                        <SkeletonLoader variant="list" count={5} />
                    ) : enrollments && enrollments.length > 0 ? (
                        <div className="space-y-3">
                            {enrollments.map((enrollment) => (
                                <Card key={enrollment.id} className="p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        {/* User Info */}
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-primary font-semibold text-sm">
                                                        {enrollment.user_email?.[0]?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{enrollment.user_email}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Inscrito em {formatDate(enrollment.enrolled_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-13 flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-primary h-full transition-all"
                                                            style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-muted-foreground">
                                                        {enrollment.progress_percentage || 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(enrollment.id, enrollment.user_email || 'este utilizador')}
                                                disabled={deletingId === enrollment.id}
                                            >
                                                {deletingId === enrollment.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Remover Acesso
                                                    </>
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
                                    <UserPlus className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Nenhum inscrito</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Este curso ainda não tem utilizadores inscritos
                                    </p>
                                    <Button onClick={() => setShowAddForm(true)}>
                                        Inscrever Primeiro Utilizador
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
