import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateLesson, useUpdateLesson, useAdminLessons, useAdminModules } from '@/hooks/useAdminCourses'
import { useCourse } from '@/hooks/useCourses'
import { Loader2, Save, X, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AdminLessonEdit() {
    const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>()
    const navigate = useNavigate()
    const isNew = lessonId === 'new'

    // Get module info
    const { data: modules } = useAdminModules('')
    const currentModule = modules?.find(m => m.id === moduleId)
    const courseId = currentModule?.course_id
    const { data: course } = useCourse(courseId!)

    const { data: lessons } = useAdminLessons(moduleId!)
    const createMutation = useCreateLesson()
    const updateMutation = useUpdateLesson()

    const [title, setTitle] = useState('')
    const [order, setOrder] = useState(1)
    const [contentType, setContentType] = useState<'video' | 'pdf' | 'text'>('video')
    const [contentUrl, setContentUrl] = useState('')
    const [contentText, setContentText] = useState('')
    const [durationMinutes, setDurationMinutes] = useState<number | undefined>(undefined)

    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    // Load existing lesson data
    useEffect(() => {
        if (lessons && !isNew) {
            const existingLesson = lessons.find(l => l.id === lessonId)
            if (existingLesson) {
                setTitle(existingLesson.title)
                setOrder(existingLesson.order)
                setContentType(existingLesson.content_type)
                setContentUrl(existingLesson.content_url || '')
                setContentText(existingLesson.content_text || '')
                setDurationMinutes(existingLesson.duration_minutes)
            }
        }
    }, [lessons, lessonId, isNew])

    // Auto-suggest next order for new lessons
    useEffect(() => {
        if (isNew && lessons && lessons.length > 0) {
            const maxOrder = Math.max(...lessons.map(l => l.order))
            setOrder(maxOrder + 1)
        }
    }, [isNew, lessons])

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

        if (!contentType) {
            setErrorMessage('Deve selecionar um tipo de conteúdo')
            return
        }

        if ((contentType === 'video' || contentType === 'pdf') && !contentUrl.trim()) {
            setErrorMessage(`A URL é obrigatória para ${contentType === 'video' ? 'vídeos' : 'PDFs'}`)
            return
        }

        if (contentType === 'text' && !contentText.trim()) {
            setErrorMessage('O conteúdo textual é obrigatório para aulas de texto')
            return
        }

        const lessonData = {
            title: title.trim(),
            order: order,
            content_type: contentType,
            content_url: (contentType === 'video' || contentType === 'pdf') ? contentUrl.trim() : '',
            content_text: contentType === 'text' ? contentText.trim() : '',
            duration_minutes: durationMinutes || undefined,
            module_id: moduleId,
        }

        try {
            if (isNew) {
                await createMutation.mutateAsync(lessonData)
                setSuccessMessage('Aula criada com sucesso!')
            } else {
                await updateMutation.mutateAsync({ id: lessonId!, updates: lessonData })
                setSuccessMessage('Aula atualizada com sucesso!')
            }

            // Redirect after short delay
            setTimeout(() => {
                navigate(`/admin/modules/${moduleId}/lessons`)
            }, 1500)
        } catch (error: any) {
            console.error('Error saving lesson:', error)
            setErrorMessage('Erro ao guardar aula. Tente novamente.')
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
                        onClick={() => navigate(`/admin/modules/${moduleId}/lessons`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar às Aulas
                    </Button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-display font-bold mb-2">
                            {isNew ? 'Nova Aula' : 'Editar Aula'}
                        </h1>
                        {currentModule && course && (
                            <p className="text-muted-foreground">
                                Curso: {course.title} / Módulo: {currentModule.title}
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
                                    placeholder="Ex: Introdução ao tema"
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
                                    Posição da aula no módulo (1, 2, 3...)
                                </p>
                            </div>

                            {/* Content Type */}
                            <div className="space-y-2">
                                <Label htmlFor="contentType">Tipo de Conteúdo *</Label>
                                <Select
                                    value={contentType}
                                    onValueChange={(value: 'video' | 'pdf' | 'text') => setContentType(value)}
                                    disabled={isSaving}
                                >
                                    <SelectTrigger id="contentType">
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="video">Vídeo</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="text">Texto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Content URL (only for video/pdf) */}
                            {(contentType === 'video' || contentType === 'pdf') && (
                                <div className="space-y-2">
                                    <Label htmlFor="contentUrl">URL do Conteúdo *</Label>
                                    <Input
                                        id="contentUrl"
                                        type="url"
                                        value={contentUrl}
                                        onChange={(e) => setContentUrl(e.target.value)}
                                        placeholder={contentType === 'video' ? 'https://youtube.com/...' : 'https://example.com/file.pdf'}
                                        required
                                        disabled={isSaving}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        URL completo do {contentType === 'video' ? 'vídeo' : 'PDF'}
                                    </p>
                                </div>
                            )}

                            {/* Content Text (only for text) */}
                            {contentType === 'text' && (
                                <div className="space-y-2">
                                    <Label htmlFor="contentText">Conteúdo Textual *</Label>
                                    <Textarea
                                        id="contentText"
                                        value={contentText}
                                        onChange={(e) => setContentText(e.target.value)}
                                        placeholder="Escreva o conteúdo da aula..."
                                        rows={10}
                                        required
                                        disabled={isSaving}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Texto que será exibido ao aluno
                                    </p>
                                </div>
                            )}

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duração (minutos)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="0"
                                    value={durationMinutes || ''}
                                    onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="Ex: 15"
                                    disabled={isSaving}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Duração estimada (opcional)
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
                                    onClick={() => navigate(`/admin/modules/${moduleId}/lessons`)}
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
