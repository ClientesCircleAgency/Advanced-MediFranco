import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { BlogPost, BlogPostInput } from "@/types/blog";

interface BlogPostDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post?: BlogPost | null;
}

export function BlogPostDialog({ open, onOpenChange, post }: BlogPostDialogProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<BlogPostInput>({
        title: "",
        subtitle: "",
        content: "",
        author: "",
        images: [],
        slug: "",
        published_at: new Date().toISOString(),
    });
    const [newImageUrl, setNewImageUrl] = useState("");

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                author: post.author,
                images: post.images || [],
                slug: post.slug,
                published_at: post.published_at,
            });
        } else {
            setFormData({
                title: "",
                subtitle: "",
                content: "",
                author: "",
                images: [],
                slug: "",
                published_at: new Date().toISOString(),
            });
        }
    }, [post, open]);

    const createMutation = useMutation({
        mutationFn: async (data: BlogPostInput) => {
            const { error } = await supabase.from("blog_posts").insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
            queryClient.invalidateQueries({ queryKey: ["blog-posts-home"] });
            toast.success("Artigo criado com sucesso!");
            onOpenChange(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error("Erro ao criar artigo.");
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: BlogPostInput) => {
            if (!post?.id) return;
            const { error } = await supabase
                .from("blog_posts")
                .update(data)
                .eq("id", post.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
            queryClient.invalidateQueries({ queryKey: ["blog-posts-home"] });
            toast.success("Artigo atualizado com sucesso!");
            onOpenChange(false);
        },
        onError: () => {
            toast.error("Erro ao atualizar artigo.");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            slug: formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        };

        if (post) {
            updateMutation.mutate(dataToSubmit);
        } else {
            createMutation.mutate(dataToSubmit);
        }
    };

    const addImage = () => {
        if (!newImageUrl) return;
        setFormData((prev) => ({ ...prev, images: [...prev.images, newImageUrl] }));
        setNewImageUrl("");
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-2xl max-h-[90vh] overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{post ? "Editar Artigo" : "Novo Artigo"}</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes do artigo do blog abaixo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Novos avanços na oftalmologia"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="subtitle">Subtítulo (Opcional)</Label>
                            <Input
                                id="subtitle"
                                value={formData.subtitle || ""}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="Uma breve descrição que aparece no card"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="author">Autor</Label>
                                <Input
                                    id="author"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    placeholder="Ex: Dr. Franco"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Data de Publicação</Label>
                                <Input
                                    id="date"
                                    type="datetime-local"
                                    value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setFormData({ ...formData, published_at: new Date(e.target.value).toISOString() })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Imagens (URLs)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    placeholder="https://exemplo.com/imagem.jpg"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addImage();
                                        }
                                    }}
                                />
                                <Button type="button" onClick={addImage} size="icon" variant="secondary">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="relative group border rounded-md overflow-hidden w-24 h-16">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">Adicione múltiplas imagens para ativar o carrossel.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="content">Conteúdo</Label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(value) => setFormData({ ...formData, content: value })}
                                className="min-h-[300px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                            {post ? "Atualizar" : "Publicar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
