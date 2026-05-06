import { Link } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function CheckoutCancel() {
    return (
        <div className="flex flex-col min-h-screen">
            <SEO
                title="Pagamento Cancelado"
                description="O pagamento não foi concluído. Pode tentar novamente."
                path="/checkout/cancel"
            />
            <Header />

            <main className="flex-1 flex items-center justify-center py-12">
                <Card className="max-w-md w-full mx-4 p-8 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
                        <XCircle className="h-8 w-8" />
                    </div>

                    <h1 className="text-2xl font-display font-bold mb-2">
                        Pagamento Cancelado
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        O pagamento não foi concluído. Pode tentar novamente ou explorar outros cursos.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link to="/catalog">
                            <Button className="w-full gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Tentar Novamente
                            </Button>
                        </Link>
                        <Link to="/catalog">
                            <Button variant="outline" className="w-full gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Voltar ao Catálogo
                            </Button>
                        </Link>
                    </div>
                </Card>
            </main>

            <Footer />
        </div>
    )
}
