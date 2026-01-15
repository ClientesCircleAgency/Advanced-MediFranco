import { CheckCircle2, Circle, FileText, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LessonItemProps {
    title: string
    duration?: number
    contentType: 'video' | 'pdf' | 'text'
    isCompleted: boolean
    isActive?: boolean
    onClick: () => void
}

export function LessonItem({ title, duration, contentType, isCompleted, isActive, onClick }: LessonItemProps) {
    const Icon = contentType === 'video'
        ? PlayCircle
        : contentType === 'pdf'
            ? FileText
            : FileText

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200',
                'hover:bg-accent group',
                isActive && 'bg-accent'
            )}
        >
            {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
                <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
            )}

            <Icon className={cn(
                'h-4 w-4 flex-shrink-0 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            )} />

            <span className={cn(
                'flex-1 line-clamp-1 text-sm transition-colors',
                isActive ? 'font-medium text-foreground' : 'text-foreground/80'
            )}>
                {title}
            </span>

            {duration && duration > 0 && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                    {duration}min
                </span>
            )}
        </button>
    )
}
