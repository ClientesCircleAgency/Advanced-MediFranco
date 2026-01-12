import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { BlogPost } from '@/types/blog';
import { cn } from '@/lib/utils';

interface BlogPostCardProps {
    post: BlogPost;
    className?: string;
}

export function BlogPostCard({ post, className }: BlogPostCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (post.images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [post.images.length]);

    return (
        <Card className={cn(
            "group overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1 h-full flex flex-col",
            className
        )}>
            {/* Image Container */}
            <Link to={`/blog/${post.slug || post.id}`} className="relative aspect-[16/9] overflow-hidden block">
                {post.images.length > 0 ? (
                    post.images.map((img, index) => (
                        <div
                            key={index}
                            className={cn(
                                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                                index === currentImageIndex ? "opacity-100" : "opacity-0"
                            )}
                        >
                            <img
                                src={img}
                                alt={`${post.title} - Image ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-5000 ease-linear group-hover:scale-110"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        </div>
                    ))
                ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">Sem imagem</span>
                    </div>
                )}

                {/* Date Badge */}
                {post.published_at && (
                    <Badge variant="secondary" className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white border-none font-mono text-xs">
                        <CalendarDays className="w-3 h-3 mr-1" />
                        {format(new Date(post.published_at), "d MMM yyyy", { locale: pt })}
                    </Badge>
                )}
            </Link>

            <CardHeader className="space-y-2 pb-2">
                <Link to={`/blog/${post.slug || post.id}`} className="block">
                    <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                </Link>
                {post.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-1 font-medium">
                        {post.subtitle}
                    </p>
                )}
            </CardHeader>

            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed">
                    {post.content}
                </p>
            </CardContent>

            <CardFooter className="pt-2 flex items-center justify-between border-t border-white/5 mt-auto">
                <div className="flex items-center text-xs text-muted-foreground">
                    <User className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-[100px]">{post.author}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto hover:bg-transparent group/btn" asChild>
                    <Link to={`/blog/${post.slug || post.id}`}>
                        Ler mais
                        <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
