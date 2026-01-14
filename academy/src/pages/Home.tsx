import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/CourseCard'
import { Button } from '@/components/ui/button'
import { useCourses } from '@/hooks/useCourses'
import { GraduationCap, BookOpen, Award, Users } from 'lucide-react'

export default function Home() {
    const { data: courses, isLoading } = useCourses()
    const featuredCourses = courses?.slice(0, 3) || []

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-primary/10 to-blue-500/10 py-20 md:py-32">
                <div className="container">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Formação Online de Excelência para Profissionais de Saúde
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            Desenvolva as suas competências com cursos criados por especialistas da MediFranco.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/catalog">
                                <Button size="lg" className="gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Explorar Cursos
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="lg" variant="outline">
                                    Criar Conta Grátis
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 border-b">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center space-y-2">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-lg">Conteúdo Especializado</h3>
                            <p className="text-sm text-muted-foreground">
                                Cursos desenvolvidos por profissionais experientes
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                                <Award className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-lg">Certificação</h3>
                            <p className="text-sm text-muted-foreground">
                                Receba certificados ao concluir os cursos
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-lg">Aprenda ao Seu Ritmo</h3>
                            <p className="text-sm text-muted-foreground">
                                Acesso ilimitado aos conteúdos dos cursos
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            <section className="py-16">
                <div className="container">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold">Cursos em Destaque</h2>
                        <Link to="/catalog">
                            <Button variant="outline">Ver Todos</Button>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    )
}
