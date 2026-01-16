import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, User, ArrowLeft, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { BlogPost } from '@/types/blog';
import { toast } from 'sonner';

export default function BlogPostDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    // Fetch post by slug (assuming slug is unique or we use ID)
    // Currently relying on slug or ID. Ideally we updated the schema to have unique slug.
    // If slug is not available, we might need to handle ID route or ensure slug generation.
    // For now, let's query by ID if it looks like a UUID, or slug otherwise?
    // The previous migration added a 'slug' column.

    const { data: post, isLoading } = useQuery({
        queryKey: ['blog-post', slug],
        enabled: !!slug,
        queryFn: async () => {
            // Try to find by slug first
            let query = supabase.from('blog_posts').select('*').eq('slug', slug);

            // If slug looks like UUID (fallback) - though strict slug usage is better
            // const { data, error } = await query.single();

            // Let's stick to slug matching since we generate it on save
            const { data, error } = await query.single();

            if (error) {
                // Fallback: try by ID if slug not found (handling legacy or potential confusion)
                const { data: dataById, error: errorById } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .eq('id', slug)
                    .single();

                if (errorById) throw error;
                return { ...dataById, images: dataById.images || [] } as BlogPost;
            }

            return { ...data, images: data.images || [] } as BlogPost;
        },
    });

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para a área de transferência!");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 pt-24 pb-16 container px-4 max-w-4xl mx-auto space-y-8">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="aspect-video w-full rounded-2xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 pt-24 pb-16 container px-4 text-center">
                    <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
                    <Button onClick={() => navigate('/blog')}>Voltar ao Blog</Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pt-24 pb-16">
                <div className="container px-4 max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/blog')}
                        className="mb-8 hover:bg-accent/50 group"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Voltar ao Blog
                    </Button>

                    <article className="space-y-8 animate-fade-in">
                        {/* Header */}
                        <div className="space-y-4 text-center">
                            <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
                                <span className="flex items-center">
                                    <CalendarDays className="mr-1.5 w-4 h-4" />
                                    {post.published_at ? format(new Date(post.published_at), "d 'de' MMMM, yyyy", { locale: pt }) : 'Data N/A'}
                                </span>
                                <span className="flex items-center">
                                    <User className="mr-1.5 w-4 h-4" />
                                    {post.author}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-display text-foreground leading-tight">
                                {post.title}
                            </h1>
                            {post.subtitle && (
                                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                    {post.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Main Image */}
                        {post.images.length > 0 && (
                            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group">
                                <img
                                    src={post.images[0]}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-p:leading-relaxed prose-img:rounded-xl">
                            {/* Simplistic rendering of newlines */}
                            {post.content.split('\n').map((paragraph, idx) => (
                                paragraph.trim() !== '' ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                            ))}
                        </div>

                        {/* Gallery if more images */}
                        {post.images.length > 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                                {post.images.slice(1).map((img, idx) => (
                                    <div key={idx} className="rounded-xl overflow-hidden aspect-video shadow-lg border border-white/5">
                                        <img
                                            src={img}
                                            alt={`Galeria ${idx + 2}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Share & Footer */}
                        <div className="pt-12 border-t border-border mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="font-display font-bold text-lg">Gostou deste artigo?</p>
                            <Button variant="outline" onClick={handleShare} className="gap-2">
                                <Share2 className="w-4 h-4" />
                                Partilhar Link
                            </Button>
                        </div>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
}
