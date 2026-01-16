-- Tabela para registar vendas manuais (backoffice)
-- Esta tabela é apenas para registo administrativo
-- Não processa pagamentos
CREATE TABLE IF NOT EXISTS academy_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    currency TEXT NOT NULL DEFAULT 'EUR',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mb', 'transfer', 'other')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index para queries por curso
CREATE INDEX IF NOT EXISTS idx_academy_sales_course_id ON academy_sales(course_id);

-- Index para queries por utilizador
CREATE INDEX IF NOT EXISTS idx_academy_sales_user_id ON academy_sales(user_id);

-- Index para queries por data
CREATE INDEX IF NOT EXISTS idx_academy_sales_created_at ON academy_sales(created_at DESC);

-- RLS Policies para academy_sales
ALTER TABLE academy_sales ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todas as vendas
CREATE POLICY "Admins can view all sales"
    ON academy_sales
    FOR SELECT
    TO authenticated
    USING (is_academy_admin());

-- Admins podem criar vendas
CREATE POLICY "Admins can create sales"
    ON academy_sales
    FOR INSERT
    TO authenticated
    WITH CHECK (is_academy_admin());

-- Admins podem atualizar vendas (para correções)
CREATE POLICY "Admins can update sales"
    ON academy_sales
    FOR UPDATE
    TO authenticated
    USING (is_academy_admin());

-- Admins podem deletar vendas (caso erro)
CREATE POLICY "Admins can delete sales"
    ON academy_sales
    FOR DELETE
    TO authenticated
    USING (is_academy_admin());
