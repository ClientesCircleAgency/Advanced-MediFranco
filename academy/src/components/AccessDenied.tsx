import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, LogIn, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AccessDeniedProps {
    title?: string
    description?: string
    courseSlug?: string
}

export function AccessDenied({
    title = "Acesso Restrito",
    description = "Precisa de ter acesso a este conteúdo para o visualizar.",
    courseSlug
}: AccessDeniedProps) {
    const { user } = useAuth()

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <Lock className="h-8 w-8 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>

                <CardContent>
                    {!user ? (
                        <p className="text-sm text-muted-foreground">
                            Faça login ou crie uma conta para aceder aos cursos.
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Inscreva-se neste curso para aceder ao conteúdo.
                        </p>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    {!user ? (
                        <>
                            <Link to="/login" className="w-full">
                                <Button className="w-full gap-2">
                                    <LogIn className="h-4 w-4" />
                                    Fazer Login
                                </Button>
                            </Link>
                            <Link to="/register" className="w-full">
                                <Button variant="outline" className="w-full">
                                    Criar Conta
                                </Button>
                            </Link>
                        </>
                    ) : courseSlug ? (
                        <>
                            <Link to={`/courses/${courseSlug}`} className="w-full">
                                <Button className="w-full gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    Ver Detalhes do Curso
                                </Button>
                            </Link>
                            <Link to="/catalog" className="w-full">
                                <Button variant="outline" className="w-full">
                                    Explorar Outros Cursos
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <Link to="/catalog" className="w-full">
                            <Button className="w-full">
                                Explorar Cursos
                            </Button>
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
