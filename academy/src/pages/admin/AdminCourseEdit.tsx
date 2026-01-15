import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useCreateCourse, useUpdateCourse } from '@/hooks/useAdminCourses'
import { useCourse } from '@/hooks/useCourses'
import { Loader2, Save, X } from 'lucide-react'

export default function AdminCourseEdit() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const isNew = id === 'new'

    const { data: existingCourse, isLoading } = useCourse(isNew ? '' : id!)
    const createMutation = useCreateCourse()
    const updateMutation = useUpdateCourse()

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [priceCents, setPriceCents] = useState(0)
    const [published, setPublished] = useState(false)

    // Load existing course data
    useState(() => {
        if (existingCourse) {
            setTitle(existingCourse.title)
            setSlug(existingCourse.slug)
            setDescription(existingCourse.description)
            setImageUrl(existingCourse.image_url)
            setPriceCents(existingCourse.price_cents)
            setPublished(existingCourse.is_published)
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const courseData = {
            title,
            slug,
            description,
            image_url: imageUrl,
            price_cents: priceCents,
            is_published: published,
        }

        try {
            if (isNew) {
                await createMutation.mutateAsync(courseData)
            } else {
                await updateMutation.mutateAsync({ id: id!, updates: courseData })
            }
            navigate('/admin/courses')
        } catch (error) {
            console.error('Error saving course:', error)
            alert('Erro ao guardar curso. Verifique os dados e tente novamente.')
        }
    }

    const isSaving = createMutation.isPending || updateMutation.isPending

    if (!isNew && isLoading) {
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
                                        // Auto-generate slug from title
                                        if (isNew) {
                                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                                        }
                                    }}
                                    placeholder="Ex: Técnicas Avançadas de Dermatologia"
                                    required
                                />
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL) *</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="tecnicas-avancadas-dermatologia"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    URL: /courses/{slug || 'slug'}
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
                                />
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
                                />
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <Label htmlFor="price">Preço (€) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={priceCents / 100}
                                    onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value) * 100))}
                                    placeholder="149.00"
                                    required
                                />
                            </div>

                            {/* Published */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="published">Publicado</Label>
                                    <p className="text-sm text-muted-foreground">
                                        O curso ficará visível no catálogo
                                    </p>
                                </div>
                                <Switch
                                    id="published"
                                    checked={published}
                                    onCheckedChange={setPublished}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={isSaving} className="gap-2">
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <Save className="h-4 w-4" />
                                    Guardar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/admin/courses')}
                                    className="gap-2"
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
