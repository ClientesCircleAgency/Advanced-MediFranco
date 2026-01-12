import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import type { BlogPost } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BlogSection() {
    const { data: posts, isLoading } = useQuery({
        queryKey: ['blog-posts-home'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('published_at', { ascending: false })
                .limit(3);

            if (error) throw error;
            // Provide fallback for images if null
            return (data || []).map(post => ({
                ...post,
                images: post.images || []
            })) as BlogPost[];
        },
    });

    // Mock data for initial display if no data (optional, but good for demo)
    // Remove this in production if not needed or handle empty state
    const hasPosts = posts && posts.length > 0;

    return (
        <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter sm:text-5xl font-display">
                            Notícias & <span className="text-primary">Artigos</span>
                        </h2>
                        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                            Mantenha-se informado sobre saúde ocular e dentária com os nossos especialistas.
                        </p>
                    </div>
                    {hasPosts && (
                        <Button variant="outline" className="hidden md:flex group">
                            Ver todos os artigos
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : !hasPosts ? (
                    <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
                        <h3 className="text-xl font-medium text-muted-foreground">Em breve...</h3>
                        <p className="text-sm text-muted-foreground/60 mt-2">Nenhum artigo publicado ainda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <BlogPostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center md:hidden">
                    <Button variant="outline" className="w-full group">
                        Ver todos os artigos
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
