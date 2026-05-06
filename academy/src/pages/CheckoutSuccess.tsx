import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, BookOpen, ArrowRight } from 'lucide-react'

export default function CheckoutSuccess() {
    const queryClient = useQueryClient()

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['enrollments'] })
        queryClient.invalidateQueries({ queryKey: ['enrollment'] })
        queryClient.invalidateQueries({ queryKey: ['user-progress'] })
    }, [queryClient])

    return (
        <div className="flex flex-col min-h-screen">
            <SEO
                title="Inscrição Confirmada"
                description="O seu pagamento foi processado com sucesso na MediFranco Academy."
                path="/checkout/success"
            />
            <Header />

            <main className="flex-1 flex items-center justify-center py-12">
                <Card className="max-w-md w-full mx-4 p-8 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <h1 className="text-2xl font-display font-bold mb-2">
                        Inscrição Confirmada!
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        O seu pagamento foi processado com sucesso. Já pode aceder ao conteúdo do curso.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link to="/cursos">
                            <Button className="w-full gap-2">
                                <BookOpen className="h-4 w-4" />
                                Ir para Os Meus Cursos
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/catalog">
                            <Button variant="outline" className="w-full">
                                Explorar Mais Cursos
                            </Button>
                        </Link>
                    </div>
                </Card>
            </main>

            <Footer />
        </div>
    )
}
