# MediFranco Academy — TODO & Future Enhancements

> **Última atualização**: 2026-01-16  
> **Status Atual**: Fases 1-5 Completas ✅

---

## ✅ CONCLUÍDO

### Fase 1-5 (Completas)
- [x] Setup do projeto (Vite + React + TS + Tailwind)
- [x] Database schema (`academy_*` tables)
- [x] Auth (Supabase Email/Password)
- [x] RLS policies (read/write seguro)
- [x] Frontend completo (11 páginas)
- [x] UI/UX refinement (design minimalista)
- [x] Progress fix (SQL function segura)
- [x] Admin panel (CRUD de cursos)
- [x] Deploy (Vercel + Supabase)
- [x] Documentação completa

---

## 🚧 POR FAZER

### Alta Prioridade

#### 1. Gestão de Módulos (Admin)
**Status**: Hooks criados, UI pendente

**Tarefas**:
- [ ] Página `/admin/courses/:id/modules` (lista de módulos)
- [ ] Botão "Novo Módulo" no CourseEdit
- [ ] Formulário criar/editar módulo (título, ordem)
- [ ] Botões de reordenação (↑↓)
- [ ] Delete com confirmação

**Componentes**:
- `AdminModules.tsx` - Lista de módulos
- `ModuleForm.tsx` - Criar/editar
- `ReorderButtons.tsx` - Reordenação

---

#### 2. Gestão de Aulas (Admin)
**Status**: Hooks criados, UI pendente

**Tarefas**:
- [ ] Página `/admin/modules/:id/lessons` (lista de aulas)
- [ ] Botão "Nova Aula" no ModuleEdit
- [ ] Formulário criar/editar aula:
  - [ ] Título
  - [ ] Tipo (video/pdf/text)
  - [ ] URL (para video/pdf)
  - [ ] Texto (para text lessons)
  - [ ] Duração estimada
  - [ ] Ordem
- [ ] Preview de conteúdo
- [ ] Delete com confirmação

**Componentes**:
- `AdminLessons.tsx` - Lista de aulas
- `LessonForm.tsx` - Criar/editar
- `ContentPreview.tsx` - Preview video/pdf/text

---

#### 3. Reordenação Drag-and-Drop
**Status**: Não iniciado

**Tarefas**:
- [ ] Instalar `@dnd-kit/core` + `@dnd-kit/sortable`
- [ ] Implementar drag-and-drop para módulos
- [ ] Implementar drag-and-drop para aulas
- [ ] Auto-save ao reordenar
- [ ] Visual feedback durante drag

**Alternativa Simples** (Já preparado):
- [x] Botões ↑↓ para mover módulos/aulas
- [ ] Implementar lógica de swap

---

### Média Prioridade

#### 4. Upload de Imagens
**Status**: Não iniciado

**Tarefas**:
- [ ] Configurar Supabase Storage bucket (`academy-images`)
- [ ] RLS policies para upload (admins only)
- [ ] Component `ImageUploader.tsx`:
  - [ ] Drag-and-drop
  - [ ] Preview
  - [ ] Crop/resize
  - [ ] Progress bar
- [ ] Substituir URL input por uploader em:
  - [ ] Course form (thumbnail)
  - [ ] Lesson form (capa)

**Tecnologias Sugeridas**:
- `react-dropzone` - Upload UI
- `react-image-crop` - Crop tool

---

#### 5. Rich Text Editor (Aulas Texto)
**Status**: Campo `content_text` existe, sem editor

**Tarefas**:
- [ ] Instalar editor (sugestão: `@tiptap/react`)
- [ ] Configurar toolbar:
  - [ ] Bold, italic, underline
  - [ ] Headings (H1-H3)
  - [ ] Lists (ordered/unordered)
  - [ ] Links
  - [ ] Images (via upload)
  - [ ] Code blocks
- [ ] Implementar no `LessonForm`
- [ ] Render no Player para aulas tipo `text`

**Alternativa Simples**:
- [ ] Markdown editor (`react-markdown-editor-lite`)
- [ ] Render com `react-markdown`

---

#### 6. Player: Melhorias
**Status**: Básico funcional

**Tarefas**:
- [ ] **Timestamps/Capítulos**:
  - [ ] Campo `timestamps` em `academy_lessons` (JSONB)
  - [ ] Sidebar com lista de capítulos
  - [ ] Click para skip
- [ ] **Auto-play próxima aula**:
  - [ ] Detectar fim do vídeo
  - [ ] Countdown 5s
  - [ ] Auto-navegar
- [ ] **Picture-in-Picture**:
  - [ ] Botão PiP
  - [ ] Manter progresso
- [ ] **Speed control**:
  - [ ] Selector 0.5x - 2x
  - [ ] Persist preferência

---

#### 7. Notas por Aula
**Status**: Tab "Notas" existe vazio

**Tarefas**:
- [ ] Tabela `academy_notes`:
  - [ ] user_id, lesson_id, content, timestamp
- [ ] Component `NotesEditor.tsx`:
  - [ ] Textarea
  - [ ] Auto-save (debounced)
  - [ ] Timestamp markers
- [ ] Render no tab "Notas" do Player

---

### Baixa Prioridade (Nice-to-Have)

#### 8. Certificados de Conclusão
**Tarefas**:
- [ ] Template de certificado (SVG/PDF)
- [ ] Gerar ao completar 100% do curso
- [ ] Unique ID + QR code de verificação
- [ ] Página `/certificates/:id` (pública)
- [ ] Botão download no Dashboard

---

#### 9. Sistema de Avaliações
**Tarefas**:
- [ ] Tabela `academy_reviews`:
  - [ ] user_id, course_id, rating (1-5), comment
- [ ] Component `RatingStars.tsx`
- [ ] Form de review no CourseDetail (se enrolled)
- [ ] Display de média + reviews

---

#### 10. Analytics de Progresso
**Tarefas**:
- [ ] Dashboard admin: Stats gerais
  - [ ] Total alunos, cursos, aulas assistidas
  - [ ] Taxa de conclusão por curso
  - [ ] Tempo médio de conclusão
- [ ] Gráficos (sugestão: `recharts`)
- [ ] Exportar relatórios CSV

---

#### 11. Email Notifications
**Tarefas**:
- [ ] Configurar Supabase Edge Functions:
  - [ ] Welcome email ao registar
  - [ ] Confirmação de inscrição
  - [ ] Reminder se curso parado >7 dias
  - [ ] Parabéns ao completar curso
- [ ] Templates (Resend ou SendGrid)

---

#### 12. Search & Filters
**Tarefas**:
- [ ] Search bar no Catalog
- [ ] Filtros:
  - [ ] Por categoria (adicionar campo)
  - [ ] Por preço (free, paid, range)
  - [ ] Por dificuldade (adicionar campo)
- [ ] Sort: Popularidade, Preço, Recente

---

#### 13. Acessibilidade & UX
**Tarefas**:
- [ ] **Dark mode**:
  - [ ] Toggle no header
  - [ ] Persist preferência
  - [ ] CSS variables adaptadas
- [ ] **Keyboard navigation**:
  - [ ] Atalhos (← → para navegar aulas)
  - [ ] Tab focus visível
- [ ] **Screen reader**:
  - [ ] ARIA labels
  - [ ] Landmarks
  - [ ] Skip links

---

#### 14. PWA (Offline Support)
**Tarefas**:
- [ ] Service worker (`vite-plugin-pwa`)
- [ ] Manifest.json
- [ ] Cache estratégias:
  - [ ] API responses (Workbox)
  - [ ] Assets estáticos
- [ ] Offline indicator
- [ ] Sync ao voltar online

---

#### 15. Integrações Reais

##### Stripe (Pagamentos)
**Status**: Stub (mock checkout)

**Tarefas**:
- [ ] Criar produtos no Stripe
- [ ] Checkout Session API
- [ ] Webhook handler:
  - [ ] `checkout.session.completed`
  - [ ] Criar enrollment
- [ ] Success/Cancel pages

##### n8n (Automação)
**Tarefas**:
- [ ] Workflow: Enrollment → Email
- [ ] Workflow: Conclusão → Certificado
- [ ] Workflow: Reminder emails

---

## 📊 Roadmap Sugerido

### Sprint 1 (1-2 semanas)
1. ✅ Gestão de Módulos (Admin)
2. ✅ Gestão de Aulas (Admin)
3. ✅ Reordenação (botões ↑↓)

### Sprint 2 (1-2 semanas)
4. Upload de imagens
5. Rich text editor
6. Player: Timestamps

### Sprint 3 (1-2 semanas)
7. Notas por aula
8. Certificados
9. Sistema de reviews

### Sprint 4+ (Futuro)
- Analytics
- Email notifications
- Search & filters
- PWA
- Stripe integration

---

## 🎯 Prioridades por Impacto

| Funcionalidade | Impacto | Esforço | Prioridade |
|----------------|---------|---------|------------|
| Gestão Módulos/Aulas | 🔴 Alto | Médio | **P0** |
| Upload Imagens | 🟠 Médio | Médio | P1 |
| Rich Text Editor | 🟠 Médio | Baixo | P1 |
| Certificados | 🟡 Baixo | Médio | P2 |
| Stripe | 🔴 Alto | Alto | P2 |
| Analytics | 🟠 Médio | Alto | P3 |
| PWA | 🟡 Baixo | Alto | P4 |

---

*Este documento será atualizado conforme novas funcionalidades forem implementadas.*
