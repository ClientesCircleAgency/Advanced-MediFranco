import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import type { BlogPost } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function BlogListingPage() {
    const { data: posts, isLoading } = useQuery({
        queryKey: ['blog-posts-listing'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('published_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(post => ({
                ...post,
                images: post.images || []
            })) as BlogPost[];
        },
    });

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pt-24 pb-16">
                <div className="container px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 font-display">
                            Blog & <span className="text-primary">Notícias</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Artigos de especialistas sobre saúde oral e oftalmologia.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : posts && posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <BlogPostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
                            <h3 className="text-xl font-medium text-muted-foreground">Em breve...</h3>
                            <p className="text-sm text-muted-foreground/60 mt-2">Nenhum artigo publicado ainda.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
