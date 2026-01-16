import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreateCourse, useUpdateCourse } from '@/hooks/useAdminCourses'
import { useCourse } from '@/hooks/useCourses'
import { Loader2, Save, X, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AdminCourseEdit() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const isNew = id === 'new'

    const { data: existingCourse, isLoading: loadingCourse } = useCourse(isNew ? '' : id!)
    const createMutation = useCreateCourse()
    const updateMutation = useUpdateCourse()

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [priceCents, setPriceCents] = useState(0)
    const [published, setPublished] = useState(false)

    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    // Load existing course data
    useEffect(() => {
        if (existingCourse && !isNew) {
            setTitle(existingCourse.title)
            setSlug(existingCourse.slug)
            setDescription(existingCourse.description)
            setImageUrl(existingCourse.image_url)
            setPriceCents(existingCourse.price_cents)
            setPublished(existingCourse.is_published)
        }
    }, [existingCourse, isNew])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSuccessMessage('')
        setErrorMessage('')

        // Validations
        if (!title.trim() || title.length < 3) {
            setErrorMessage('O título deve ter pelo menos 3 caracteres')
            return
        }

        if (!slug.trim() || !/^[a-z0-9-]+$/.test(slug)) {
            setErrorMessage('O slug deve conter apenas letras minúsculas, números e hífens')
            return
        }

        if (!description.trim() || description.length < 10) {
            setErrorMessage('A descrição deve ter pelo menos 10 caracteres')
            return
        }

        if (!imageUrl.trim()) {
            setErrorMessage('A URL da imagem é obrigatória')
            return
        }

        if (priceCents < 0) {
            setErrorMessage('O preço não pode ser negativo')
            return
        }

        const courseData = {
            title: title.trim(),
            slug: slug.trim(),
            description: description.trim(),
            image_url: imageUrl.trim(),
            price_cents: priceCents,
            is_published: published,
        }

        try {
            if (isNew) {
                await createMutation.mutateAsync(courseData)
                setSuccessMessage('Curso criado com sucesso!')
            } else {
                await updateMutation.mutateAsync({ id: id!, updates: courseData })
                setSuccessMessage('Curso atualizado com sucesso!')
            }

            // Redirect after short delay
            setTimeout(() => {
                navigate('/admin/courses')
            }, 1500)
        } catch (error: any) {
            console.error('Error saving course:', error)

            // Check for unique constraint violation (slug already exists)
            if (error.message?.includes('duplicate') || error.code === '23505') {
                setErrorMessage('Este slug já está a ser utilizado. Escolha outro.')
            } else {
                setErrorMessage('Erro ao guardar curso. Verifique os dados e tente novamente.')
            }
        }
    }

    const isSaving = createMutation.isPending || updateMutation.isPending

    if (!isNew && loadingCourse) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 py-12 bg-muted/30">
                <div className="container max-w-3xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-display font-bold mb-2">
                            {isNew ? 'Novo Curso' : 'Editar Curso'}
                        </h1>
                        <p className="text-muted-foreground">
                            Preencha os detalhes do curso
                        </p>
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
                                    onChange={(e) => {
                                        setTitle(e.target.value)
                                        // Auto-generate slug from title (only for new courses)
                                        if (isNew) {
                                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                                        }
                                    }}
                                    placeholder="Ex: Técnicas Avançadas de Dermatologia"
                                    required
                                    disabled={isSaving}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Mínimo 3 caracteres
                                </p>
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL) *</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                                    placeholder="tecnicas-avancadas-dermatologia"
                                    required
                                    disabled={isSaving}
                                />
                                <p className="text-xs text-muted-foreground">
                                    URL: /courses/{slug || 'slug'} • Apenas letras minúsculas, números e hífens
                                </p>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição *</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descreva o curso e o que os alunos vão aprender..."
                                    rows={4}
                                    required
                                    disabled={isSaving}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Mínimo 10 caracteres
                                </p>
                            </div>

                            {/* Image URL */}
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">URL da Imagem *</Label>
                                <Input
                                    id="imageUrl"
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    required
                                    disabled={isSaving}
                                />
                                {imageUrl && (
                                    <div className="mt-2">
                                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            className="h-32 w-auto rounded-lg border"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <Label htmlFor="price">Preço (€) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={priceCents / 100}
                                    onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value || '0') * 100))}
                                    placeholder="149.00"
                                    required
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Published */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="published">Publicado</Label>
                                    <p className="text-sm text-muted-foreground">
                                        O curso ficará visível no catálogo público
                                    </p>
                                </div>
                                <Switch
                                    id="published"
                                    checked={published}
                                    onCheckedChange={setPublished}
                                    disabled={isSaving}
                                />
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
                                    onClick={() => navigate('/admin/courses')}
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
