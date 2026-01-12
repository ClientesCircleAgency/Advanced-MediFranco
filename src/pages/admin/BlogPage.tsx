import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
                        <p className="text-muted-foreground">
                            Gerencie as notícias e artigos do blog.
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Artigo
                    </Button>
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
                        <div className="rounded-md border">
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
                    </CardContent>
                </Card>

                <BlogPostDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    post={selectedPost}
                />
            </div>
        </AdminLayout>
    );
}
