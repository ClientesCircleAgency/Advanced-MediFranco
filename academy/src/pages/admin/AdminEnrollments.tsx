import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useAdminEnrollments, useCreateEnrollment, useDeleteEnrollment, useAdminCourses } from '@/hooks/useAdminCourses'
import { Plus, Trash2, Loader2, AlertCircle, UserPlus, CheckCircle2, BookOpen } from 'lucide-react'

export default function AdminEnrollments() {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')

    const { data: courses, isLoading: coursesLoading } = useAdminCourses()
    const { data: enrollments, isLoading, isError, error } = useAdminEnrollments(selectedCourseId)
    const createMutation = useCreateEnrollment()
    const deleteMutation = useDeleteEnrollment()

    const [showAddForm, setShowAddForm] = useState(false)
    const [userEmail, setUserEmail] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const selectedCourse = courses?.find(c => c.id === selectedCourseId)

    const handleAddEnrollment = async (e: React.FormEvent) => {
        e.preventDefault()
        setSuccessMessage('')
        setErrorMessage('')

        if (!selectedCourseId) {
            setErrorMessage('Selecione um curso primeiro')
            return
        }

        if (!userEmail.trim()) {
            setErrorMessage('O email é obrigatório')
            return
        }

        try {
            const result = await createMutation.mutateAsync({ courseId: selectedCourseId, userEmail: userEmail.trim() })

            // Check if already exists (RPC returns {already_exists: true})
            if (result && typeof result === 'object' && 'already_exists' in result && result.already_exists) {
                setErrorMessage(`Utilizador já está inscrito neste curso`)
                setTimeout(() => setErrorMessage(''), 5000)
            } else {
                setSuccessMessage('Utilizador inscrito com sucesso!')
                setUserEmail('')
                setShowAddForm(false)
                setTimeout(() => setSuccessMessage(''), 3000)
            }
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
        <div className="flex flex-col min-h-screen bg-muted/30">
            <main className="flex-1 py-12">
                <div className="container max-w-5xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-display font-bold mb-2">
                                    Inscritos
                                </h1>
                                <p className="text-muted-foreground">
                                    Gerir utilizadores inscritos por curso
                                </p>
                            </div>
                            {selectedCourseId && (
                                <Button
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    size="lg"
                                    className="gap-2"
                                    variant={showAddForm ? "outline" : "default"}
                                >
                                    {showAddForm ? (
                                        <>
                                            <AlertCircle className="h-5 w-5" />
                                            Cancelar
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-5 w-5" />
                                            Inscrever Utilizador
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        {/* Course Selector */}
                        <Card className="p-6 mb-6">
                            <div className="space-y-2">
                                <Label htmlFor="course-select" className="text-base font-semibold">
                                    Selecionar Curso
                                </Label>
                                {coursesLoading ? (
                                    <div className="h-10 bg-muted animate-pulse rounded-md" />
                                ) : (
                                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                        <SelectTrigger id="course-select" className="w-full">
                                            <SelectValue placeholder="Escolha um curso para ver inscritos..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses?.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{course.title}</span>
                                                        <span className="text-muted-foreground">
                                                            ({course.enrollments_count || 0} inscritos)
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {selectedCourse && (
                                    <p className="text-sm text-muted-foreground">
                                        {selectedCourse.enrollments_count || 0} {selectedCourse.enrollments_count === 1 ? 'inscrito' : 'inscritos'}
                                    </p>
                                )}
                            </div>
                        </Card>
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
                                {errorMessage || (error instanceof Error ? error.message : 'Não foi possível carregar os inscritos. Verifique as permissões ou contacte suporte.')}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Add Enrollment Form */}
                    {showAddForm && selectedCourseId && (
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
                    {!selectedCourseId ? (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Selecione um curso</h3>
                                    <p className="text-muted-foreground">
                                        Escolha um curso acima para ver os utilizadores inscritos
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : isLoading ? (
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
        </div>
    )
}
