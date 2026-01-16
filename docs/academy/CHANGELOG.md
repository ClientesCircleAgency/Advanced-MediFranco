# MediFranco Academy — Changelog

> Histórico de alterações do projeto

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
