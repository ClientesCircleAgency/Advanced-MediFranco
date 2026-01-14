import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/CourseCard'
import { useEnrollments } from '@/hooks/useEnrollments'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

export default function Dashboard() {
    const { data: enrollments, isLoading } = useEnrollments()
    const [searchParams] = useSearchParams()
    const justEnrolled = searchParams.get('enrolled') === 'true'

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 py-12">
                <div className="container">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-4">Meus Cursos</h1>
                        <p className="text-lg text-muted-foreground">
                            Aceda aos cursos em que está inscrito
                        </p>
                    </div>

                    {justEnrolled && (
                        <Alert className="mb-8 border-green-500/50 bg-green-500/10">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-500">
                                Inscrição realizada com sucesso! Pode agora aceder ao curso.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : enrollments && enrollments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.map((enrollment) => (
                                enrollment.course && (
                                    <CourseCard
                                        key={enrollment.id}
                                        course={enrollment.course}
                                        enrolled={true}
                                    />
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">Ainda não está inscrito em nenhum curso.</p>
                            <Link
                                to="/catalog"
                                className="text-primary hover:underline font-medium"
                            >
                                Explorar Cursos
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
