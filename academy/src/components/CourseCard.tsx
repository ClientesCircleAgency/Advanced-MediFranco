import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, BookOpen } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Course } from '@/types'

interface CourseCardProps {
    course: Course
    enrolled?: boolean
}

export function CourseCard({ course, enrolled }: CourseCardProps) {
    const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0
    const totalDuration = course.modules?.reduce(
        (acc, mod) => acc + (mod.lessons?.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0) || 0),
        0
    ) || 0

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                    src={course.image_url}
                    alt={course.title}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                />
            </div>

            <CardHeader>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{totalLessons} aulas</span>
                    </div>
                    {totalDuration > 0 && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{Math.ceil(totalDuration / 60)}h</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
                <div className="text-2xl font-bold">{formatPrice(course.price_cents)}</div>
                <Link to={`/courses/${course.slug}`}>
                    <Button>{enrolled ? 'Continuar' : 'Ver Curso'}</Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
