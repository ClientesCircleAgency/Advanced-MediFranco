import { cn } from '@/lib/utils'

interface CourseProgressProps {
    completed: number
    total: number
    percentage: number
    className?: string
    showText?: boolean
}

export function CourseProgress({ completed, total, percentage, className, showText = true }: CourseProgressProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {showText && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{Math.round(percentage)}% concluído</span>
                    <span>{completed}/{total} aulas</span>
                </div>
            )}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
