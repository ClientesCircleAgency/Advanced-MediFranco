# MediFranco Academy — Changelog

> Histórico de alterações do projeto

---

## [Feature] - 2026-01-19

### 🏗️ Sales-First Architecture (PRODUCTION)

**Objetivo**: Garantir **1 inscrição = 1 venda, sempre**. Sales como fonte única de verdade para acesso a cursos.

**Implementação Database** (Migrations 012-015):
- **FK Constraint**: `academy_enrollments.sale_id` → obrigatório, CASCADE delete
- **Trigger**: Criar sale → enrollment criado automaticamente
- **RLS Policies**: Admin pode SELECT/INSERT/DELETE em ambas as tabelas
- **Data Migration**: Sales retroativas para enrollments órfãos
- **Unique Index**: 1 enrollment por sale (zero duplicados)

**Fluxo Refatorado**:
1. Admin → "Inscrever Utilizador" → cria **sale primeiro**
2. Trigger cria enrollment automaticamente
3. Apagar enrollment → deleta sale → CASCADE remove enrollment
4. Duplicados bloqueados com mensagem de erro vermelha

**Frontend Changes**:
- `useCreateEnrollment` → chama `admin_create_sale_and_enrollment` RPC
- `useDeleteEnrollment` → deleta via sales table (CASCADE)
- `AdminEnrollments.tsx` → detecta duplicados, mostra erro vermelho

**Garantias** (Database-level):
- ❌ **Impossível**: Enrollment sem sale (FK NOT NULL bloqueia)
- ❌ **Impossível**: Sale sem enrollment (trigger cria)
- ❌ **Impossível**: Duplicados (unique index)
- ❌ **Impossível**: Orphans após delete (CASCADE)

**Validação** (Produção Testada):
- ✅ Inscrever utilizador cria sale + enrollment
- ✅ Apagar enrollment remove sale (CASCADE)
- ✅ Duplicados bloqueados (mensagem vermelha)
- ✅ Revenue sincronizada perfeitamente
- ✅ Data integrity: PERFECT (0 orphans)
- ✅ Alunos veem cursos em `/cursos`

---

## [Feature] - 2026-01-19

### ✨ Auto-Sale on Manual Enrollment

**Objetivo**: Quando admin inscreve manualmente um utilizador, criar automaticamente registo de venda.

**Implementação**:
- **[MODIFY] RPC** `admin_create_enrollment_by_email` (migration 010)
  - Agora cria **enrollment** E **sale** automaticamente
  - Busca preço do curso de `academy_courses.price_cents`
  - Cria venda com `payment_method = 'manual'`
  - Notas: "Auto-sale from manual enrollment"
  - **Prevenção de duplicados**: verifica se já existe venda manual para o mesmo user+course

**Fluxo**:
1. Admin → `/admin/enrollments` → "Inscrever Utilizador"
2. Sistema cria `academy_enrollments` ✅
3. Sistema cria `academy_sales` automaticamente ✅
4. Ambos aparecem nas respectivas páginas admin
5. Aluno vê curso em `/cursos`

**Bugfixes** (mesmo dia):
- **[FIX] Course Title Display** - Corrigido `sale.course?.title` → `sale.course_title`
- **[FIX] Student Dashboard RPC** - Criado workaround para bypass PostgREST 403
  - Migration 011 corrigiu RPC com `completed_at IS NOT NULL`
  - Frontend usa query direta para evitar latência de cache PostgREST
  - Alunos veem cursos inscritos imediatamente

**Validação** (Produção Testada):
- ✅ Inscrever utilizador cria venda automática
- ✅ Aparece em `/admin/enrollments`
- ✅ Aparece em `/admin/sales` com nome de curso correto
- ✅ Analytics atualizam (Total Vendas, Receita)
- ✅ Aluno vê curso em `/cursos` (Dashboard)
- ✅ Zero "Curso N/A"

---

## [Hotfix] - 2026-01-19

### 🔥 CRITICAL FIX: AdminSales Production Crash

**Problema**: Ecrã branco em `/admin/sales` com erro `TypeError: can't access property 'substring', _user_id is undefined`. Após visitar a página, todo o `/admin` ficava inutilizável até limpar cookies.

**Causa Raiz**: 
- Linha 392 em `AdminSales.tsx` tentava aceder `sale.user_id.substring(0, 8)`
- O RPC `admin_list_sales` retorna `buyer_email`, NÃO `user_id`
- Quando `sale.user_id` era `undefined`, causava crash JavaScript fatal

**Fix Aplicado**:
```diff
- <p className="truncate" title={sale.user_id}>{sale.user_id.substring(0, 8)}...</p>
+ <p className="truncate" title={sale.buyer_email || 'N/A'}>
+     {sale.buyer_email || '—'}
+ </p>
```

**Resultado**:
- ✅ `/admin/sales` carrega sem erros
- ✅ Exibe email do comprador em vez de UUID truncado
- ✅ Fallback seguro (`'—'`) quando email não disponível
- ✅ Console sem erros TypeError
- ✅ Área admin não fica "presa" após visitar Sales

---

## [Fase 7.7-B] - 2026-01-18

###  FECHO FINAL: Correções Críticas de Produção

**Objetivo**: Estabilizar ambiente de produção (Vercel + Supabase) sem erros  ZERO features novas

#### Bugs Corrigidos

**1. Routing Admin  /cursos (CRÍTICO)**
- **Problema**: Não-admin ao tentar `/admin/*` acabava redirecionado para `/cursos` (área do aluno)
- **Causa**: `ProtectedAdminRoute.tsx` redirecionava para `/dashboard`  `/cursos`
- **Solução**: Access Denied UI para não-admin + redirect /login para não-autenticado

**2. Enrollment por Email (User Lookup)**
- **Problema**: "Utilizador não encontrado" mesmo quando existe
- **Causa**: Query direta `auth.users` não funciona (schema isolation)
- **Solução**: RPC `admin_create_enrollment_by_email` (migration 009)

#### Ficheiros Alterados
- `ProtectedAdminRoute.tsx` - Access Denied UI
- `useAdminCourses.ts` - RPC admin_create_enrollment_by_email
- `009_admin_create_enrollment_by_email.sql` - Nova migration

 **Ver `docs/academy/MANUAL_ACTIONS.md` para aplicar migrations em produção**

**Build**: 681KB JS (193KB gzip) | **Commit**: 202559f

---


### 🔧 Admin Area RPC Fix (FINAL CLOSURE)

**Objetivo**: Corrigir joins proibidos com `auth.users` usando SECURITY DEFINER RPCs. Fechar Fase 7.7 sem erros.

**Critical Fix**:
- **[FIX] Forbidden Schema Joins** - AdminEnrollments e AdminSales falhavam ao tentar join com `auth.users` (schema `auth`) via Supabase client
- **Solution**: Postgres SECURITY DEFINER RPCs que executam com privilégios elevados

**Database (SQL Migration)**:
- **[NEW] Migration** `20260117_000001_admin_rpc_enrollments_sales.sql`
- **[NEW] RPC** `admin_list_enrollments(p_course_id)` 
  - Returns:enrollment_id, user_id, user_email, created_at, total_lessons, completed_lessons, progress_percentage
  - Joins `academy_enrollments` → `auth.users` (email)
  - Calculates progress via `academy_progress` + lesson counts
  - Guard: `is_academy_admin(auth.uid())`
  
- **[NEW] RPC** `admin_list_sales(p_days)` 
  - Returns: sale_id, created_at, amount_cents, currency, course_id, course_title, buyer_email
  - Joins `academy_sales` → `auth.users` (email) + `academy_courses` (title)
  - Guard: admin only
  
- **[NEW] RPC** `admin_sales_analytics(p_days)`
  - Returns JSON: total_revenue_cents, total_sales_count, avg_ticket_cents, top_courses[]
  - Server-side aggregation (performance)
  - Guard: admin only

**Frontend (Hooks)**:
- **[MODIFY] useAdminEnrollments** (`src/hooks/useAdminCourses.ts`)
  - Changed from `.select()` with relationship join to `.rpc('admin_list_enrollments')`
  - Maps RPC result to expected format
  - Better error messages

- **[MODIFY] useAdminSales** (`src/hooks/useAdminCourses.ts`)
  - Changed from `.select()` query to `.rpc('admin_list_sales', { p_days: 90 })`
  - Error handling with fallback

- **[MODIFY] useSalesAnalytics** (`src/hooks/useAdminCourses.ts`)
  - Changed from client-side JS aggregation to `.rpc('admin_sales_analytics')`
  - Server-side calculation = better performance
  - Graceful fallback to zeros on error

**Status**: 
- ✅ AdminEnrollments loads without "relationship not found" error
- ✅ AdminSales loads without permission errors
- ✅ Build passes (TypeScript + Vite)
- ✅ Zero "Erro desconhecido" messages
- ✅ **Fase 7.7 ENCERRADA (FINAL)**

---

## [Fase 7.7] - 2026-01-17

### 🔧 Admin Routes Fix + Student Routes + Improved Admin Pages

**Admin Layout Persistence**:
- **[FIX] Admin Routes Structure** (`src/App.tsx`)
  - Converted all `/admin/*` routes to nested routes under `AdminLayout`
  - `AdminLayout` now wraps all admin pages using `<Outlet />` from React Router
  - Sidebar now persists across all admin pages (Dashboard, Cursos, Inscritos, Vendas)
  - Removed duplicate `ProtectedAdminRoute` wrappers from individual routes
  
- **[MODIFY] AdminLayout** (`src/components/layout/AdminLayout.tsx`)
  - Changed from `children` prop to `<Outlet />` for nested routing
  - Updated sidebar navigation links (Inscritos now has dedicated route)
  - Removed unused `ReactNode` import

**Student Routes**:
- **[MODIFY] Student Dashboard Route** (`src/App.tsx`)
  - Changed route from `/dashboard` to `/cursos`
  - Added redirect: `/dashboard` → `/cursos` (Navigate with replace)
  - Maintains backward compatibility for existing links

**Admin: Inscritos (Improved)**:
- **[MODIFY] AdminEnrollments** (`src/pages/admin/AdminEnrollments.tsx`)
  - Removed dependency on `:courseId` route parameter
  - Added course selector dropdown (powered by `useAdminCourses`)
  - Shows enrollment count per course in selector
  - Improved UX: select course first, then view/manage enrollments
  - Displays: email, enrollment date, progress percentage
  - Empty state when no course selected
  - Route: `/admin/enrollments` (no param)

**Admin: Vendas (Analytics Upgrade)**:
- **[NEW] useSalesAnalytics Hook** (`src/hooks/useAdminCourses.ts`)
  - Calculates total revenue, sales count, average ticket
  - Revenue by period (7/30/90 days)
  - Top 5 courses by revenue
  - Top 5 courses by sales count
  - Single query with all analytics computed

- **[MODIFY] AdminSales** (`src/pages/admin/AdminSales.tsx`)
  - Added analytics dashboard section above sales list
  - **Stats Cards**: Total Revenue, Total Sales, Average Ticket
  - **Period Filter**: Toggle between 7/30/90 days view
  - **Top Courses**: Two columns showing top by revenue and by sales
  - Maintains existing sales registration form and list
  - Clean, card-based layout

**Build Stats**: 690KB JS (195KB gzip), 32.5KB CSS (+15KB JS since Fase 7.6)

---


## [Fase 7.6] - 2026-01-16

###  Admin: Shell & Dashboard

**Estrutura Definitiva do Admin**:

#### Components
- **[NEW] AdminLayout** (`src/components/layout/AdminLayout.tsx`)
  - Layout base reutilizável para todo o Admin
  - Sidebar fixa (desktop) com navegação
  - Links: Dashboard, Cursos, Inscritos, Vendas
  - Estado ativo visível
  - Botão terminar sessão
  - Visual limpo

#### Hooks
- **[NEW] useAdminDashboardStats** (`src/hooks/useAdminCourses.ts`)
  - Stats agregadas para dashboard
  - Total cursos (publicados + rascunhos)
  - Total alunos (distinct user_ids)
  - Total vendas e receita

#### Pages
- **[NEW] AdminDashboard** (`src/pages/admin/AdminDashboard.tsx`)
  - Rota: `/admin`
  - Cards de stats operacionais
  - Últimas 5 vendas
  - Ações rápidas

**Build Stats**: 675KB JS (192KB gzip), 32.2KB CSS

---
## [Fase 7.5.1] - 2026-01-16

### 🔧 Correções: Vendas Manuais

**Correções Implementadas**:

#### Database
- **[NEW] RPC find_user_by_email** (`supabase/migrations/008_find_user_by_email.sql`)
  - Função para resolver `user_id` a partir de email
  - SECURITY DEFINER para acesso a auth.users
  - GRANT para authenticated users

#### Hooks
- **[FIX] useCreateSale** (`src/hooks/useAdminCourses.ts`)
  - ✅ **Enrollment automático implementado**
  - ✅ **Removido workaround de email em notas**
  - Fluxo corrigido:
    1. Resolver user_id via RPC `find_user_by_email()`
    2. Criar registo de venda
    3. Verificar se enrollment existe
    4. Criar enrollment automaticamente se não existir
  - Tratamento de erros melhorado:
    - "Utilizador não encontrado" se email inválido
    - Não duplica enrollments existentes
    - Continua se enrollment falhar (venda já criada)

**Alterações**:
- Campo `notes` agora usado apenas para notas reais (não guarda email)
- User lookup 100% funcional via RPC
- Sistema alinhado com escopo original da Fase 7.5

**Sem alterações em**:
- UI/UX (zero mudanças)
- RLS policies
- Outros hooks ou componentes

---

## [Fase 7.5] - 2026-01-16

### 🎯 Admin: Vendas Manuais

**Funcionalidades Implementadas**:

#### Database
- **[NEW] Tabela academy_sales** (`supabase/migrations/007_academy_sales.sql`)
  - Campos:
    - `id` (UUID, PK)
    - `course_id` (FK → academy_courses)
    - `user_id` (FK → auth.users)
    - `amount_cents` (integer, >= 0)
    - `currency` (text, default 'EUR')
    - `payment_method` (enum: cash | mb | transfer | other)
    - `notes` (text, opcional)
    - `created_at` (timestamptz)
  - Indexes: course_id, user_id, created_at
  - **RLS Policies**: Apenas admins (SELECT, INSERT, UPDATE, DELETE)
  
⚠️ **Importante**: Esta tabela é apenas para registo administrativo. Não processa pagamentos.

#### Types
- **[NEW] Sale interface** (`src/types/index.ts`)
  - Define estrutura de vendas manuais

#### Hooks
- **[NEW] useAdminSales** (`src/hooks/useAdminCourses.ts`)
  - Hook para buscar todas as vendas registadas
  - Retorna `SaleWithDetails[]` (extends `Sale`)
  - Inclui: `course_title`
  - Ordenado por data de criação (DESC)

- **[NEW] useCreateSale** (`src/hooks/useAdminCourses.ts`)
  - Hook para registar venda manual
  - Parâmetros:
    - `courseId` - ID do curso
    - `userEmail` - Email do utilizador (guardado em notes temporariamente)
    - `amountCents` - Valor em cêntimos
    - `paymentMethod` - Método de pagamento
    - `notes` - Notas adicionais
  - Comportamento:
    - Cria registo em academy_sales
    - Guarda email do utilizador nas notas (solução temporária)
  - ⚠️ **Nota produção**: Requer RPC para buscar user_id por email

#### Pages

##### Vendas Manuais (`src/pages/admin/AdminSales.tsx`)
**Rota**: `/admin/sales`

**Funcionalidades**:
- Lista de vendas registadas
- Exibição por venda:
  - Ícone € verde
  - Título do curso
  - Data e hora (formato PT)
  - Valor formatado
  - Método de pagamento
  - ID do utilizador
  - Notas (se existir)
- Navegação:
  - Botão "Voltar aos Cursos"
- Estados completos:
  - Loading (skeleton)
  - Empty (sem vendas)
  - Error (alert vermelho)

**Layout**:
```
[← Voltar aos Cursos]
Vendas Manuais                    [Registar Venda]
Registo administrativo (não processa pagamentos)
---
[$] Curso de Exemplo
    16/01/2026 22:30
    Valor: €49.99  |  Método: Multibanco
    Utilizador: 12345678...
    Notas: Email: user@example.com
```

**Formulário de Registo (Inline)**:
- Botão "Registar Venda" toggle form
- **Aviso obrigatório**: 
  > "Esta ação apenas regista a venda administrativamente. Não processa pagamentos."
  
- Campos:
  - **Curso** (select com preço)
  - **Email do utilizador** (text)
  - **Valor** (€, decimal)
  - **Método de pagamento** (select: dinheiro/MB/transferência/outro)
  - **Notas** (textarea, opcional)

- Validações:
  - Curso obrigatório
  - Email obrigatório
  - Valor > 0
  - Método obrigatório

- Feedback:
  - Alert verde success (auto-hide 4s)
  - Alert vermelho erro
  - Loading state

- Comportamento:
  - Form fecha após sucesso
  - Email guardado nas notas

#### Routing
- **[MODIFY] App.tsx**
  - Adicionada rota: `/admin/sales`
  - Protegida por `ProtectedAdminRoute`

**Build Stats**: 667KB JS (190KB gzip), 31.2KB CSS (+9KB JS desde Fase 7.4)

---

### ⚠️ Limitações Conhecidas (Fase 7.5)

1. **User lookup**: Email do utilizador é guardado nas notas (solução temporária)
   - **Solução produção**: Criar RPC `find_user_by_email(email text)` no Supabase
   
2. **Enrollment automático**: Não implementado nesta fase
   - Deve ser criado manualmente ou na próxima fase

3. **Sem processamento de pagamento**: Sistema apenas regista vendas
   - Stripe será integrado em fase futura

---

## [Fase 7.4] - 2026-01-16

### 🎯 Admin: Gestão de Inscritos

**Funcionalidades Implementadas**:

#### Hooks
- **[NEW] useAdminEnrollments** (`src/hooks/useAdminCourses.ts`)
  - Hook para buscar inscritos de um curso com dados do utilizador
  - Retorna `EnrollmentWithUser[]` (extends `Enrollment`)
  - Inclui: `user_email`, `progress_percentage`
  - Usa join com tabela `auth.users` para obter email
  - Calcula progresso via RPC `get_my_course_progress()`
  - Ordenado por data de inscrição (DESC)

- **[NEW] useCreateEnrollment** (`src/hooks/useAdminCourses.ts`)
  - Hook para inscrever utilizador existente por email
  - Valida se utilizador existe antes de criar enrollment
  - Detecta duplicados (error 23505)
  - Mensagens de erro específicas:
    - "Utilizador não encontrado"
    - "Já está inscrito"

- **[NEW] useDeleteEnrollment** (`src/hooks/useAdminCourses.ts`)
  - Hook para remover acesso de utilizador
  - Remove apenas enrollment
  - Não elimina utilizador nem progresso

#### Pages

##### Gestão de Inscritos (`src/pages/admin/AdminEnrollments.tsx`)
**Rota**: `/admin/courses/:courseId/enrollments`

**Funcionalidades**:
- Lista de inscritos do curso
- Exibição por inscrição:
  - Avatar com inicial do email
  - Email do utilizador
  - Data de inscrição (formato PT)
  - **Barra de progresso** (%)
- Navegação:
  - Botão "Voltar aos Cursos"
  - Nome do curso no header
- Estados completos:
  - Loading (skeleton)
  - Empty (sem inscritos)
  - Error (alert vermelho)

**Layout**:
```
[← Voltar aos Cursos]
Inscritos — Nome do Curso    [Inscrever Utilizador]
---
[U] user@example.com
    Inscrito em 16/01/2026
    [████████░░] 80%
    [Remover Acesso]
```

**Inscrição Manual (Formulário Inline)**:
- Botão "Inscrever Utilizador" toggle form
- Campo: Email do utilizador (obrigatório)
- Validações:
  - Email obrigatório
  - Utilizador deve existir
  - Não pode já estar inscrito
- Feedback visual:
  - Alert verde: "Utilizador inscrito com sucesso!"
  - Alert vermelho: Erros específicos
  - Loading state no botão
- Comportamento:
  - Form fecha automaticamente após sucesso
  - Mensagem desaparece após 3s

**Remoção de Acesso**:
- Botão "Remover Acesso" por inscrição
- Confirmação obrigatória com aviso claro:
  > "O utilizador não será eliminado, apenas o seu acesso ao curso"
- Loading state durante eliminação

#### Routing
- **[MODIFY] App.tsx**
  - Adicionada rota: `/admin/courses/:courseId/enrollments`
  - Protegida por `ProtectedAdminRoute`

**Build Stats**: 797KB JS (237KB gzip), 30.8KB CSS (+7KB JS desde Fase 7.3)

---

## [Fase 7.3] - 2026-01-16

### 🎯 Admin: Gestão de Aulas

**Funcionalidades Implementadas**:

#### Hooks
- **[NEW] useAdminLessons** (`src/hooks/useAdminCourses.ts`)
  - Hook para buscar aulas de um módulo
  - Retorna array de `Lesson[]`
  - Ordenado automaticamente por `order` (ASC)
  - Enabled apenas se `moduleId` fornecido

- **[MODIFY] Lesson mutations** (useCreateLesson, useUpdateLesson, useDeleteLesson)
  - Atualizados `invalidateQueries` para incluir:
    - `admin-lessons` (lista de aulas)
    - `admin-modules` (contagens afetadas)

#### Types
- **[MODIFY] Lesson interface** (`src/types/index.ts`)
  - Adicionado campo `content_text?: string` para aulas tipo texto

#### Components
- **[NEW] Select** (`src/components/ui/select.tsx`)
  - Component shadcn Select (Radix UI)
  - Usado para seleção de tipo de conteúdo

#### Pages

##### Lista de Aulas (`src/pages/admin/AdminLessons.tsx`)
**Rota**: `/admin/modules/:moduleId/lessons`

**Funcionalidades**:
- Lista de aulas do módulo
- Exibição por aula:
  - Badge circular com número da ordem
  - Título
  - Tipo de conteúdo (Video/PDF/Texto com ícone)
  - Duração em minutos
- Ações:
  - Editar aula
  - Eliminar aula (confirmação obrigatória)
- Navegação:
  - Botão "Voltar aos Módulos"
  - Nome do curso e módulo no header
- Estados completos:
  - Loading (skeleton)
  - Empty (sem aulas)
  - Error (alert vermelho)

**Layout**:
```
[← Voltar aos Módulos]
Aulas — Nome do Módulo
Curso: Nome do Curso          [Nova Aula]
---
[1] Título da Aula
    🎬 Vídeo  ⏱ 15 min
    [Editar] [🗑️]
```

##### Criar/Editar Aula (`src/pages/admin/AdminLessonEdit.tsx`)
**Rotas**: 
- `/admin/modules/:moduleId/lessons/new`
- `/admin/modules/:moduleId/lessons/:lessonId`

**Campos**:
- Título (obrigatório, min 3 chars)
- Ordem (número inteiro >= 1)
- Tipo de conteúdo (select): video / pdf / text
- **URL do conteúdo** (condicional):
  - Obrigatório se tipo = video ou pdf
  - Oculto se tipo = text
- **Conteúdo textual** (condicional):
  - Textarea
  - Obrigatório se tipo = text
  - Oculto se tipo = video ou pdf
- Duração (minutos, opcional, >= 0)

**Validações Condicionais**:
- ✅ Se tipo = video/pdf → URL obrigatório
- ✅ Se tipo = text → conteúdo textual obrigatório
- ✅ Apenas campos relevantes exibidos

**Features**:
- Auto-sugestão de ordem (max + 1) para novas aulas
- Validações condicionais baseadas no tipo
- Feedback visual completo:
  - Alert verde sucesso
  - Alert vermelho erro
  - Loading state
- Navegação:
  - Botão "Voltar às Aulas"
  - Breadcrumb (Curso / Módulo)
  - Auto-redirect após sucesso (1.5s)

#### Routing
- **[MODIFY] App.tsx**
  - Adicionadas rotas:
    - `/admin/modules/:moduleId/lessons`
    - `/admin/modules/:moduleId/lessons/:lessonId`
  - Ambas protegidas por `ProtectedAdminRoute`

**Build Stats**: 790KB JS (236KB gzip), 30.8KB CSS (+229KB JS desde Fase 7.2)

**Nota sobre bundle size**: Aumento significativo devido a Radix UI Select e lógica condicional do formulário. Considerar code-splitting se necessário.

---


## [Fase 7.2] - 2026-01-16

### 🎯 Admin: Gestão de Módulos

**Funcionalidades Implementadas**:

#### Hooks
- **[NEW] useAdminModules** (`src/hooks/useAdminCourses.ts`)
  - Hook para buscar módulos de um curso com stats
  - Retorna `ModuleWithStats[]` (extends `Module`)
  - Inclui `lessons_count`: Número de aulas do módulo
  - Ordenado automaticamente por `order` (ASC)
  - Enabled apenas se `courseId` fornecido

- **[MODIFY] Module mutations** (useCreateModule, useUpdateModule, useDeleteModule)
  - Atualizados `invalidateQueries` para incluir:
    - `admin-modules` (lista de módulos)
    - `admin-courses` (contagens afetadas)

#### Pages

##### Lista de Módulos (`src/pages/admin/AdminModules.tsx`)
**Rota**: `/admin/courses/:courseId/modules`

**Funcionalidades**:
- Lista de módulos do curso
- Exibição por módulo:
  - Badge circular com número da ordem
  - Título
  - Nº de aulas (ícone FileText)
- Ações:
  - Editar módulo
  - Eliminar módulo (confirmação obrigatória com aviso de cascata)
- Navegação:
  - Botão "Voltar aos Cursos"
  - Nome do curso no header
- Estados completos:
  - Loading (skeleton)
  - Empty (sem módulos)
  - Error (alert vermelho)

**Layout**:
```
[← Voltar aos Cursos]
Módulos — Nome do Curso          [Novo Módulo]
---
[1] Título do Módulo
    📝 5 aulas
    [Editar] [🗑️]
```

##### Criar/Editar Módulo (`src/pages/admin/AdminModuleEdit.tsx`)
**Rotas**: 
- `/admin/courses/:courseId/modules/new`
- `/admin/courses/:courseId/modules/:moduleId`

**Campos**:
- Título (obrigatório, min 3 chars)
- Ordem (número inteiro >= 1)

**Features**:
- Auto-sugestão de ordem (max + 1) para novos módulos
- Validações:
  - Título min 3 caracteres
  - Ordem >= 1
- Feedback visual:
  - Alert verde sucesso
  - Alert vermelho erro
  - Loading state
- Navegação:
  - Botão "Voltar aos Módulos"
  - Nome do curso no header
  - Auto-redirect após sucesso (1.5s)

#### Routing
- **[MODIFY] App.tsx**
  - Adicionadas rotas:
    - `/admin/courses/:courseId/modules`
    - `/admin/courses/:courseId/modules/:moduleId`
  - Ambas protegidas por `ProtectedAdminRoute`

**Build Stats**: 561KB JS (161KB gzip), 26.7KB CSS (+8KB JS desde Fase 7.1)

---

## [Fase 7.1] - 2026-01-16

### 🎯 Admin: Gestão de Cursos (Refinamento)

**Melhorias Implementadas**:

#### Components
- **[MODIFY] Alert Component** (`src/components/ui/alert.tsx`)
  - Adicionada variant `success` (verde) para feedback positivo
  - Mantidas variants existentes: `default`, `destructive`

#### Hooks
- **[NEW] useTogglePublished** (`src/hooks/useAdminCourses.ts`)
  - Hook para toggle rápido de publicação de cursos
  - Atualiza estado `is_published` com um clique
  - Invalida caches de `admin-courses` e `courses`

- **[MODIFY] useAdminCourses** (`src/hooks/useAdminCourses.ts`)
  - Agora retorna `CourseWithStats` (extends `Course`)
  - Inclui contagens:
    - `modules_count`: Número de módulos do curso
    - `lessons_count`: Número de aulas (todas as aulas de todos os módulos)
    - `enrollments_count`: Número de inscritos
  - Usa `Promise.all` para carregar stats em paralelo
  - Queries otimizadas com `count: 'exact', head: true`

#### Pages

##### Lista de Cursos (`src/pages/admin/AdminCourses.tsx`)
**Novas Funcionalidades**:
- Linha de estatísticas por curso:
  - 📚 X módulos
  - 📝 X aulas
  - 👥 X inscritos
- Botão toggle publicar/despublicar (botão do meio)
  - Ícone Eye (publicar) / EyeOff (despublicar)
  - Loading state com spinner
- Estado de erro robusto com `Alert` vermelho
- Feedback visual melhorado

**Layout**:
```
[Imagem com badge Publicado/Rascunho]
Título (2 linhas max)
Descrição (2 linhas max)
Preço
---
[Stats: Módulos | Aulas | Inscritos]
---
[Editar] [Toggle Published] [Eliminar]
```

**Estados**:
- ✅ Loading: Skeleton loader (3 cards)
- ✅ Empty: Card com mensagem e CTA
- ✅ Error: Alert vermelho com mensagem
- ✅ Success: Grid de cards

##### Criar/Editar Curso (`src/pages/admin/AdminCourseEdit.tsx`)
**Melhorias**:
- **useEffect** em vez de `useState` para carregar dados existentes
- **Validações robustas**:
  - Título: min 3 chars
  - Slug: formato válido ([a-z0-9-]+), único
  - Descrição: min 10 chars
  - Imagem: URL obrigatório
  - Preço: >= 0
- **Feedback visual**:
  - Alert verde de sucesso (auto-redirect em 1.5s)
  - Alert vermelho de erro (com mensagens específicas)
  - Detecção de slug duplicado (PostgreSQL error 23505)
- **Preview de imagem**: Mostra preview se URL for válido
- **Auto-geração de slug**: Apenas para cursos novos
- **Loading states**: Botão disabled + spinner durante save
- **Mensagens descritivas**:
  - "A guardar..." durante submit
  - Erros específicos (ex: "Este slug já está a ser utilizado")

---

## [Fase 5] - 2026-01-15

### Progress Fix & Admin Panel (Base)

**SQL**:
- Criada função `get_my_course_progress()` (fix de cálculo)
- Criada tabela `academy_admins` (whitelist)
- Funções `is_academy_admin()` e `is_current_user_admin()`
- RLS policies separadas (INSERT/UPDATE/DELETE) para admins

**Frontend**:
- Hook `useUserProgress()` para progresso correto
- Hook `useIsAdmin()` para verificar admin
- Component `ProtectedAdminRoute`
- Páginas Admin: `AdminCourses`, `AdminCourseEdit` (versão básica)
- CRUD completo para cursos (hooks)

---

## [Fase 4] - 2026-01-15

### UI/UX Deep Refinement

**Components Novos**:
- SkeletonLoader, EmptyState, CourseProgress, LessonItem
- Accordion, Tabs (Radix UI)

**Páginas Refinadas**:
- Dashboard: Lista limpa, progress bars, empty state
- CourseDetail: Hero compacto, accordion de módulos
- Player: 2-col layout, tabs, sticky playlist

**Build**: 535KB JS (155KB gzip), 24KB CSS

---

## [Fases 1-3] - 2026-01-14

### Setup, Database & Frontend Core

- Projeto Vite + React + TypeScript + Tailwind
- Schema completo (`academy_*` tables)
- RLS policies (15+ policies)
- Auth (Supabase Email/Password)
- 11 páginas (8 públicas, 3 admin)
- 25+ components
- 12 custom hooks

**Build**: 505KB JS (148KB gzip), 20KB CSS

---

## 📊 Build Stats (Atual)

| Métrica | Valor | Anterior | Δ |
|---------|-------|----------|---|
| **JS Bundle** | 561KB | 553KB | +8KB |
| **JS Gzipped** | 161KB | 160KB | +1KB |
| **CSS Bundle** | 26.7KB | 26.6KB | +0.1KB |
| **Build Time** | 9.4s | 9.6s | -0.2s |

**Razão do aumento**: Gestão de módulos (queries adiciona para stats)

---

## 🔄 Breaking Changes

**Nenhuma** nesta fase. Todas as alterações são retrocompatíveis.

---

## 🐛 Bug Fixes

### Fase 7.2
- **useCourse signature**: Corrigido para aceitar apenas 1 argumento nas páginas admin

### Fase 7.1
- **Alert**: Adicionada variant success (antes só tinha default e destructive)
- **Slug validation**: Agora detecta slugs duplicados antes de submeter
- **Image preview**: Falhas de carregamento não quebram a página

### Fase 5
- **Progress calculation**: Nunca mais "X/0 aulas"
- **Admin routes**: 404 resolvido com vercel.json

---

## 🚀 Próximas Fases

### Fase 7.3 — Gestão de Aulas
- Lista de aulas por módulo
- Criar/editar/eliminar aula
- Suporte para video/pdf/text
- Reordenação de aulas

### Fase 7.4 — Gestão de Inscritos
- Lista de enrollments
- Filtros (por curso, por data)
- Detalhes do aluno

### Fase 7.5 — Vendas Manuais
- Inscrever aluno manualmente
- Validação de email/NIF
- Registo de pagamento offline

---

*Última atualização: 2026-01-16 (Fase 7.2 completa)*

