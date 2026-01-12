import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { BlogPostDialog } from "@/components/admin/blog/BlogPostDialog";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import type { BlogPost } from "@/types/blog";

export default function BlogPage() {
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const queryClient = useQueryClient();

    const { data: posts, isLoading } = useQuery({
        queryKey: ["blog-posts"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("blog_posts")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data || []).map(post => ({
                ...post,
                images: post.images || []
            })) as BlogPost[];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("blog_posts").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
            queryClient.invalidateQueries({ queryKey: ["blog-posts-home"] });
            toast.success("Artigo removido com sucesso.");
        },
        onError: () => {
            toast.error("Erro ao remover artigo.");
        },
    });

    const filteredPosts = posts?.filter((post) =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.author.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (post: BlogPost) => {
        setSelectedPost(post);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedPost(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem a certeza que deseja remover este artigo?")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif italic text-foreground text-lg lg:text-2xl">Blog</h1>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
                        Gerencie as notícias e artigos do blog.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={async () => {
                        const samplePosts = [
                            {
                                title: "Novos Avanços na Oftalmologia em 2024",
                                subtitle: "Descubra as tecnologias que estão a revolucionar o tratamento da visão",
                                author: "Dr. Franco",
                                slug: "novos-avancos-oftalmologia-2024",
                                content: `
                                    <h2>Tecnologia de Ponta</h2>
                                    <p>A oftalmologia tem vindo a sofrer <strong>grandes transformações</strong> nos últimos anos. Com o advento de novas tecnologias laser, as cirurgias refrativas tornaram-se:</p>
                                    <ul>
                                        <li>Mais seguras</li>
                                        <li>Mais rápidas</li>
                                        <li>Com recuperação quase imediata</li>
                                    </ul>
                                    <p>Na <em>MediFranco</em>, estamos na vanguarda destas inovações.</p>
                                    <blockquote>"A visão é o nosso sentido mais precioso."</blockquote>
                                `,
                                images: ["https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop"],
                                published_at: new Date().toISOString()
                            },
                            {
                                title: "A Importância do Check-up Dentário",
                                subtitle: "Por que deve visitar o dentista a cada 6 meses",
                                author: "Dra. Silva",
                                slug: "importancia-checkup-dentario",
                                content: `
                                    <p>Muitas pessoas só visitam o dentista quando sentem dor. Este é um <strong>erro comum</strong>.</p>
                                    <p>Um check-up regular permite detetar:</p>
                                    <ol>
                                        <li>Cáries em fase inicial</li>
                                        <li>Problemas nas gengivas</li>
                                        <li>Desgaste dentário</li>
                                    </ol>
                                    <p>A prevenção é sempre o <u>melhor remédio</u>.</p>
                                `,
                                images: ["https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=2000&auto=format&fit=crop"],
                                published_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
                            },
                            {
                                title: "Nutrição e Saúde Ocular",
                                subtitle: "Alimentos que protegem os seus olhos",
                                author: "Dr. Franco",
                                slug: "nutricao-saude-ocular",
                                content: `
                                    <p>Sabia que o que come afeta a sua visão? Alimentos ricos em:</p>
                                    <ul>
                                        <li>Vitamina A (Cenouras)</li>
                                        <li>Ômega-3 (Peixes gordos)</li>
                                        <li>Luteína (Vegetais de folha verde)</li>
                                    </ul>
                                    <p>São essenciais para manter uma retina saudável.</p>
                                `,
                                images: [
                                    "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2000&auto=format&fit=crop",
                                    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2000&auto=format&fit=crop"
                                ],
                                published_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
                            }
                        ];

                        try {
                            const { error } = await supabase.from("blog_posts").insert(samplePosts);
                            if (error) throw error;
                            queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
                            queryClient.invalidateQueries({ queryKey: ["blog-posts-home"] });
                            toast.success("Posts de exemplo gerados com sucesso!");
                        } catch (error) {
                            console.error(error);
                            toast.error("Erro ao gerar posts de exemplo.");
                        }
                    }}>
                        Gerar Exemplos
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Artigo
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium">Artigos Publicados</CardTitle>
                    <div className="flex items-center gap-2 pt-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Pesquisar por título ou autor..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop View (Table) */}
                    <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Autor</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            A carregar...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPosts?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Nenhum artigo encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPosts?.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{post.title}</span>
                                                    {post.subtitle && <span className="text-xs text-muted-foreground">{post.subtitle}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>{post.author}</TableCell>
                                            <TableCell>
                                                {post.published_at
                                                    ? format(new Date(post.published_at), "d MMM yyyy", { locale: pt })
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(post)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive/90"
                                                        onClick={() => handleDelete(post.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View (Cards) */}
                    <div className="md:hidden space-y-4">
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">A carregar...</div>
                        ) : filteredPosts?.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">Nenhum artigo encontrado.</div>
                        ) : (
                            filteredPosts?.map((post) => (
                                <div key={post.id} className="flex flex-col gap-3 p-4 border rounded-lg bg-card shadow-sm">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold line-clamp-2">{post.title}</h3>
                                        {post.subtitle && <p className="text-sm text-muted-foreground line-clamp-1">{post.subtitle}</p>}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            {post.author}
                                        </span>
                                        <span>
                                            {post.published_at
                                                ? format(new Date(post.published_at), "d MMM yyyy", { locale: pt })
                                                : "N/A"}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t mt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 h-9"
                                            onClick={() => handleEdit(post)}
                                        >
                                            <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 h-9 text-destructive hover:text-destructive bg-destructive/5 hover:bg-destructive/10 border-destructive/20"
                                            onClick={() => handleDelete(post.id)}
                                        >
                                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Apagar
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <BlogPostDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                post={selectedPost}
            />
        </div>
    );
}
