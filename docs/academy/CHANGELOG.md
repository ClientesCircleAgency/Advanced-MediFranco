# MediFranco Academy — Changelog

> Histórico de alterações do projeto

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

