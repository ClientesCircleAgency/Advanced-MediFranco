import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function BlogPostPage() {
    const { slug } = useParams();

    const { data: post, isLoading } = useQuery({
        queryKey: ["blog-post", slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("blog_posts")
                .select("*")
                .eq("slug", slug)
                .single();

            if (error) throw error;
            return {
                ...data,
                images: data.images || []
            } as BlogPost;
        },
    });

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-grow container py-24 px-4 md:px-6">
                    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-16 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold font-display">Artigo não encontrado</h1>
                        <p className="text-muted-foreground">O artigo que procura não existe ou foi removido.</p>
                        <Button asChild>
                            <Link to="/">Voltar à página inicial</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
            <Header />

            <main className="flex-grow pt-24 pb-16">
                {/* Hero Section */}
                <section className="relative px-4 md:px-6 mb-12 md:mb-20">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden pointer-events-none -z-10">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] delay-700 animate-pulse" />
                    </div>

                    <div className="container max-w-4xl mx-auto space-y-6 md:space-y-8">
                        {/* Back Link */}
                        <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
                            <Link
                                to="/"
                                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
                            >
                                <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Voltar
                            </Link>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                            <span className="flex items-center bg-secondary/50 px-3 py-1 rounded-full text-secondary-foreground border border-secondary">
                                <Calendar className="mr-2 w-3.5 h-3.5" />
                                {post.published_at ? format(new Date(post.published_at), "dd 'de' MMMM, yyyy", { locale: pt }) : "Data não disponível"}
                            </span>
                            <span className="flex items-center">
                                <Clock className="mr-2 w-3.5 h-3.5" />
                                5 min leitura
                            </span>
                            <span className="flex items-center">
                                <User className="mr-2 w-3.5 h-3.5" />
                                {post.author}
                            </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.1]">
                                {post.title}
                            </h1>
                            {post.subtitle && (
                                <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl">
                                    {post.subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Featured Image */}
                {post.images && post.images.length > 0 && (
                    <div className="container px-4 md:px-6 mb-12 md:mb-20 animate-scale-in origin-center" style={{ animationDelay: "300ms" }}>
                        <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50 max-w-5xl mx-auto group">
                            <img
                                src={post.images[0]}
                                alt={post.title}
                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Content */}
                <article className="container px-4 md:px-6 max-w-3xl mx-auto selection:bg-primary/30">
                    <div
                        className="prose prose-lg md:prose-xl dark:prose-invert max-w-none 
                prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight 
                prose-p:leading-relaxed prose-p:text-muted-foreground 
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:p-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                prose-img:rounded-xl prose-img:shadow-lg
                animate-fade-in-up"
                        style={{ animationDelay: "400ms" }}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Share / Footer of Article */}
                    <div className="mt-16 pt-8 border-t flex justify-between items-center animate-fade-in" style={{ animationDelay: "500ms" }}>
                        <p className="font-display font-bold text-lg">Gostou deste artigo?</p>
                        <Button variant="outline" className="rounded-full" onClick={() => {
                            navigator.share({
                                title: post.title,
                                text: post.subtitle || "",
                                url: window.location.href
                            }).catch(() => {
                                alert("Link copiado para a área de transferência!");
                                navigator.clipboard.writeText(window.location.href);
                            });
                        }}>
                            Partilhar
                        </Button>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
