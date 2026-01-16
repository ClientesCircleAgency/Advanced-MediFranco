import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreateModule, useUpdateModule, useAdminModules } from '@/hooks/useAdminCourses'
import { useCourse } from '@/hooks/useCourses'
import { Loader2, Save, X, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AdminModuleEdit() {
    const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>()
    const navigate = useNavigate()
    const isNew = moduleId === 'new'

    const { data: course } = useCourse(courseId!)
    const { data: modules } = useAdminModules(courseId!)
    const createMutation = useCreateModule()
    const updateMutation = useUpdateModule()

    const [title, setTitle] = useState('')
    const [order, setOrder] = useState(1)

    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    // Load existing module data
    useEffect(() => {
        if (modules && !isNew) {
            const existingModule = modules.find(m => m.id === moduleId)
            if (existingModule) {
                setTitle(existingModule.title)
                setOrder(existingModule.order)
            }
        }
    }, [modules, moduleId, isNew])

    // Auto-suggest next order for new modules
    useEffect(() => {
        if (isNew && modules && modules.length > 0) {
            const maxOrder = Math.max(...modules.map(m => m.order))
            setOrder(maxOrder + 1)
        }
    }, [isNew, modules])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSuccessMessage('')
        setErrorMessage('')

        // Validations
        if (!title.trim() || title.length < 3) {
            setErrorMessage('O título deve ter pelo menos 3 caracteres')
            return
        }

        if (order < 1) {
            setErrorMessage('A ordem deve ser maior ou igual a 1')
            return
        }

        const moduleData = {
            title: title.trim(),
            order: order,
            course_id: courseId,
        }

        try {
            if (isNew) {
                await createMutation.mutateAsync(moduleData)
                setSuccessMessage('Módulo criado com sucesso!')
            } else {
                await updateMutation.mutateAsync({ id: moduleId!, updates: moduleData })
                setSuccessMessage('Módulo atualizado com sucesso!')
            }

            // Redirect after short delay
            setTimeout(() => {
                navigate(`/admin/courses/${courseId}/modules`)
            }, 1500)
        } catch (error: any) {
            console.error('Error saving module:', error)
            setErrorMessage('Erro ao guardar módulo. Tente novamente.')
        }
    }

    const isSaving = createMutation.isPending || updateMutation.isPending

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 py-12 bg-muted/30">
                <div className="container max-w-2xl">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4 gap-2"
                        onClick={() => navigate(`/admin/courses/${courseId}/modules`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar aos Módulos
                    </Button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-display font-bold mb-2">
                            {isNew ? 'Novo Módulo' : 'Editar Módulo'}
                        </h1>
                        {course && (
                            <p className="text-muted-foreground">
                                Curso: {course.title}
                            </p>
                        )}
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <Alert variant="success" className="mb-6">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Card className="p-6 space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Título *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Introdução ao Curso"
                                    required
                                    disabled={isSaving}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Mínimo 3 caracteres
                                </p>
                            </div>

                            {/* Order */}
                            <div className="space-y-2">
                                <Label htmlFor="order">Ordem *</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    min="1"
                                    value={order}
                                    onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                                    required
                                    disabled={isSaving}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Número que define a posição do módulo no curso (1, 2, 3...)
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={isSaving} className="gap-2">
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <Save className="h-4 w-4" />
                                    {isSaving ? 'A guardar...' : 'Guardar'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(`/admin/courses/${courseId}/modules`)}
                                    className="gap-2"
                                    disabled={isSaving}
                                >
                                    <X className="h-4 w-4" />
                                    Cancelar
                                </Button>
                            </div>
                        </Card>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    )
}
