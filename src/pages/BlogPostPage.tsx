import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { BlogPost } from "@/types/blog";
import { SimplifiedHeader } from "@/components/SimplifiedHeader";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Mock data - replace with real data when database is connected
const mockPosts: BlogPost[] = [
    {
        id: '1',
        title: 'Novos Avanços na Oftalmologia em 2024',
        subtitle: 'Descubra as tecnologias que estão a revolucionar o tratamento da visão',
        author: 'Dr. Franco',
        slug: 'novos-avancos-oftalmologia-2024',
        content: `<h2>Tecnologia de Ponta</h2><p>A oftalmologia tem vindo a sofrer <strong>grandes transformações</strong> nos últimos anos.</p>`,
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
        content: `<p>Muitas pessoas só visitam o dentista quando sentem dor.</p>`,
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
        content: `<p>Sabia que o que come afeta a sua visão?</p>`,
        images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2000&auto=format&fit=crop'],
        published_at: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
    },
];

export default function BlogPostPage() {
    const { slug } = useParams();

    const post = useMemo(() => {
        return mockPosts.find(p => p.slug === slug) || null;
    }, [slug]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    if (!post) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <SimplifiedHeader />
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
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 overflow-x-hidden w-full">
            <SimplifiedHeader />

            <main className="flex-grow pt-24 pb-16 w-full max-w-[100vw] overflow-x-hidden">
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
                        <div className="space-y-4 animate-fade-in-up break-words" style={{ animationDelay: "200ms" }}>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.1] break-words">
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

                {/* Featured Image or Carousel */}
                {post.images && post.images.length > 0 && (
                    <div className="container px-4 md:px-6 mb-12 md:mb-20 animate-scale-in origin-center" style={{ animationDelay: "300ms" }}>
                        <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50 max-w-5xl mx-auto group">
                            {post.images.length > 1 ? (
                                <Carousel
                                    className="w-full h-full"
                                    plugins={[
                                        Autoplay({
                                            delay: 4000,
                                        })
                                    ]}
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}
                                >
                                    <CarouselContent className="h-full">
                                        {post.images.map((image, index) => (
                                            <CarouselItem key={index} className="h-full">
                                                <div className="relative w-full h-full aspect-video">
                                                    <img
                                                        src={image}
                                                        alt={`${post.title} - Imagem ${index + 1}`}
                                                        className="object-cover w-full h-full"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-4 bg-background/50 hover:bg-background border-none backdrop-blur-sm" />
                                    <CarouselNext className="right-4 bg-background/50 hover:bg-background border-none backdrop-blur-sm" />
                                </Carousel>
                            ) : (
                                <>
                                    <img
                                        src={post.images[0]}
                                        alt={post.title}
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Content */}
                <article className="container px-4 md:px-6 max-w-3xl mx-auto selection:bg-primary/30 w-full overflow-hidden">
                    <div
                        className="prose prose-lg md:prose-xl dark:prose-invert max-w-none w-full
                prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight 
                prose-p:leading-relaxed prose-p:text-muted-foreground 
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:p-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                prose-img:rounded-xl prose-img:shadow-lg
                animate-fade-in-up break-words overflow-anywhere"
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
