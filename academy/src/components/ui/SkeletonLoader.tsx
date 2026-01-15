import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
    variant?: 'card' | 'list' | 'player'
    count?: number
    className?: string
}

export function SkeletonLoader({ variant = 'card', count = 1, className }: SkeletonLoaderProps) {
    const items = Array.from({ length: count })

    if (variant === 'card') {
        return (
            <div className={cn('space-y-6', className)}>
                {items.map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-5/6 mb-4"></div>
                        <div className="flex items-center justify-between">
                            <div className="h-2 bg-muted rounded w-32"></div>
                            <div className="h-9 bg-muted rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (variant === 'list') {
        return (
            <div className={cn('space-y-3', className)}>
                {items.map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                        <div className="h-4 w-4 bg-muted rounded-full flex-shrink-0"></div>
                        <div className="h-4 bg-muted rounded flex-1"></div>
                        <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (variant === 'player') {
        return (
            <div className={cn('space-y-4', className)}>
                <div className="aspect-video bg-muted rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
            </div>
        )
    }

    return null
}
