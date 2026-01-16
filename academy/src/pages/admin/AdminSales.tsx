import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdminSales, useCreateSale } from '@/hooks/useAdminCourses'
import { useAdminCourses } from '@/hooks/useAdminCourses'
import { Plus, ArrowLeft, Loader2, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react'

export default function AdminSales() {
    const navigate = useNavigate()

    const { data: sales, isLoading, isError, error } = useAdminSales()
    const { data: courses } = useAdminCourses()
    const createMutation = useCreateSale()

    const [showAddForm, setShowAddForm] = useState(false)
    const [courseId, setCourseId] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [amountEuros, setAmountEuros] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mb' | 'transfer' | 'other'>('cash')
    const [notes, setNotes] = useState('')

    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSuccessMessage('')
        setErrorMessage('')

        if (!courseId) {
            setErrorMessage('Selecione um curso')
            return
        }

        if (!userEmail.trim()) {
            setErrorMessage('O email do utilizador é obrigatório')
            return
        }

        const amount = parseFloat(amountEuros)
        if (isNaN(amount) || amount <= 0) {
            setErrorMessage('O valor deve ser maior que 0')
            return
        }

        try {
            await createMutation.mutateAsync({
                courseId,
                userEmail: userEmail.trim(),
                amountCents: Math.round(amount * 100),
                paymentMethod,
                notes: notes.trim() || undefined,
            })
            setSuccessMessage('Venda registada com sucesso! Enrollment criado automaticamente.')
            setShowAddForm(false)
            setCourseId('')
            setUserEmail('')
            setAmountEuros('')
            setPaymentMethod('cash')
            setNotes('')
            setTimeout(() => setSuccessMessage(''), 4000)
        } catch (err: any) {
            setErrorMessage(err.message || 'Erro ao registar venda')
        }
    }

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

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            cash: 'Dinheiro',
            mb: 'Multibanco',
            transfer: 'Transferência',
            other: 'Outro'
        }
        return labels[method] || method
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 py-12 bg-muted/30">
                <div className="container max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-4 gap-2"
                            onClick={() => navigate('/admin/courses')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar aos Cursos
                        </Button>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-display font-bold mb-2">
                                    Vendas Manuais
                                </h1>
                                <p className="text-muted-foreground">
                                    Registo administrativo de vendas (não processa pagamentos)
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowAddForm(!showAddForm)}
                                size="lg"
                                className="gap-2"
                                variant={showAddForm ? "outline" : "default"}
                            >
                                {showAddForm ? <ArrowLeft className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                                {showAddForm ? 'Cancelar' : 'Registar Venda'}
                            </Button>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <Alert variant="success" className="mb-6">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {(errorMessage || isError) && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {errorMessage || (error instanceof Error ? error.message : 'Erro desconhecido')}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Add Sale Form */}
                    {showAddForm && (
                        <Card className="p-6 mb-6">
                            <div className="mb-4">
                                <Alert className="border-yellow-500 bg-yellow-50">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800">
                                        <strong>Aviso:</strong> Esta ação apenas regista a venda administrativamente.
                                        Não processa pagamentos. O enrollment será criado automaticamente.
                                    </AlertDescription>
                                </Alert>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Course */}
                                <div className="space-y-2">
                                    <Label htmlFor="course">Curso *</Label>
                                    <Select value={courseId} onValueChange={setCourseId} disabled={createMutation.isPending}>
                                        <SelectTrigger id="course">
                                            <SelectValue placeholder="Selecione o curso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses?.map(course => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.title} ({formatCurrency(course.price_cents)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* User Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="userEmail">Email do Utilizador *</Label>
                                    <Input
                                        id="userEmail"
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        placeholder="utilizador@example.com"
                                        required
                                        disabled={createMutation.isPending}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Utilizador deve estar registado
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Valor (€) *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={amountEuros}
                                        onChange={(e) => setAmountEuros(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        disabled={createMutation.isPending}
                                    />
                                </div>

                                {/* Payment Method */}
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMethod">Método de Pagamento *</Label>
                                    <Select
                                        value={paymentMethod}
                                        onValueChange={(value: any) => setPaymentMethod(value)}
                                        disabled={createMutation.isPending}
                                    >
                                        <SelectTrigger id="paymentMethod">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Dinheiro</SelectItem>
                                            <SelectItem value="mb">Multibanco</SelectItem>
                                            <SelectItem value="transfer">Transferência</SelectItem>
                                            <SelectItem value="other">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notas (opcional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Informações adicionais sobre a venda..."
                                        rows={3}
                                        disabled={createMutation.isPending}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="gap-2"
                                    >
                                        {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                        <Plus className="h-4 w-4" />
                                        Registar Venda
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddForm(false)
                                            setErrorMessage('')
                                        }}
                                        disabled={createMutation.isPending}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* Sales List */}
                    {isLoading ? (
                        <SkeletonLoader variant="list" count={5} />
                    ) : sales && sales.length > 0 ? (
                        <div className="space-y-3">
                            {sales.map((sale: any) => (
                                <Card key={sale.id} className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{sale.course?.title || 'Curso N/A'}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(sale.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-13 grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Valor:</span>
                                                    <p className="font-semibold">{formatCurrency(sale.amount_cents)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Método:</span>
                                                    <p>{getPaymentMethodLabel(sale.payment_method)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Utilizador:</span>
                                                    <p className="truncate" title={sale.user_id}>{sale.user_id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                            {sale.notes && (
                                                <div className="ml-13 mt-2 text-sm">
                                                    <span className="text-muted-foreground">Notas:</span>
                                                    <p className="text-sm">{sale.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Nenhuma venda registada</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Comece por registar a primeira venda manual
                                    </p>
                                    <Button onClick={() => setShowAddForm(true)}>
                                        Registar Primeira Venda
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
