import { BlogPostCard } from '@/components/blog/BlogPostCard';
import type { BlogPost } from '@/types/blog';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data - replace with real data when database is connected
const mockPosts: BlogPost[] = [
    {
        id: '1',
        title: 'Novos Avanços na Oftalmologia em 2024',
        subtitle: 'Descubra as tecnologias que estão a revolucionar o tratamento da visão',
        author: 'Dr. Franco',
        slug: 'novos-avancos-oftalmologia-2024',
        content: '<p>Conteúdo do artigo...</p>',
        images: ['https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop'],
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'A Importância do Check-up Dentário',
        subtitle: 'Por que deve visitar o dentista a cada 6 meses',
        author: 'Dra. Silva',
        slug: 'importancia-checkup-dentario',
        content: '<p>Conteúdo do artigo...</p>',
        images: ['https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=2000&auto=format&fit=crop'],
        published_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '3',
        title: 'Nutrição e Saúde Ocular',
        subtitle: 'Alimentos que protegem os seus olhos',
        author: 'Dr. Franco',
        slug: 'nutricao-saude-ocular',
        content: '<p>Conteúdo do artigo...</p>',
        images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2000&auto=format&fit=crop'],
        published_at: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
    },
];

export function BlogSection() {
    const posts = mockPosts;
    const hasPosts = posts.length > 0;

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

                {!hasPosts ? (
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
