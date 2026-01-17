import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdminDashboardStats, useAdminSales } from '@/hooks/useAdminCourses'
import { BookOpen, Users, DollarSign, FileText, Plus, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { data: stats, isLoading: statsLoading, isError: statsError } = useAdminDashboardStats()
    const { data: recentSales, isLoading: salesLoading } = useAdminSales()

    const formatCurrency = (cents: number) => {
        return `€${(cents / 100).toFixed(2)}`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <AdminLayout>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Visão geral do estado da academia
                    </p>
                </div>

                {/* Error State */}
                {statsError && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Erro ao carregar estatísticas. Tente recarregar a página.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                {statsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <SkeletonLoader variant="card" count={4} />
                    </div>
                ) : stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Courses */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total de Cursos</p>
                                <p className="text-3xl font-bold">{stats.total_courses}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {stats.published_courses} publicados · {stats.draft_courses} rascunhos
                                </p>
                            </div>
                        </Card>

                        {/* Total Students */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total de Alunos</p>
                                <p className="text-3xl font-bold">{stats.total_students}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Utilizadores com inscrições
                                </p>
                            </div>
                        </Card>

                        {/* Total Sales */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Vendas Registadas</p>
                                <p className="text-3xl font-bold">{stats.total_sales}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Registos manuais
                                </p>
                            </div>
                        </Card>

                        {/* Revenue */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
                                <p className="text-3xl font-bold">{formatCurrency(stats.total_revenue_cents)}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Vendas registadas
                                </p>
                            </div>
                        </Card>
                    </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Sales */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Vendas Recentes</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/admin/sales')}
                            >
                                Ver todas
                            </Button>
                        </div>

                        {salesLoading ? (
                            <SkeletonLoader variant="list" count={3} />
                        ) : recentSales && recentSales.length > 0 ? (
                            <div className="space-y-4">
                                {recentSales.slice(0, 5).map((sale: any) => (
                                    <div key={sale.id} className="flex items-center justify-between py-3 border-b last:border-0">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="font-medium truncate">{sale.course?.title || 'N/A'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(sale.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(sale.amount_cents)}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {sale.payment_method}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">Nenhuma venda registada</p>
                            </div>
                        )}
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-6">Ações Rápidas</h2>
                        <div className="space-y-3">
                            <Button
                                className="w-full justify-start gap-3"
                                variant="outline"
                                onClick={() => navigate('/admin/courses/new')}
                            >
                                <Plus className="h-5 w-5" />
                                Criar Novo Curso
                            </Button>
                            <Button
                                className="w-full justify-start gap-3"
                                variant="outline"
                                onClick={() => navigate('/admin/sales')}
                            >
                                <DollarSign className="h-5 w-5" />
                                Registar Venda Manual
                            </Button>
                            <Button
                                className="w-full justify-start gap-3"
                                variant="outline"
                                onClick={() => navigate('/admin/courses')}
                            >
                                <Users className="h-5 w-5" />
                                Ver Inscritos
                            </Button>
                            <Button
                                className="w-full justify-start gap-3"
                                variant="outline"
                                onClick={() => navigate('/admin/courses')}
                            >
                                <BookOpen className="h-5 w-5" />
                                Gerir Cursos
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
