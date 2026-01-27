# 🏥 MediFranco Backend - Prompt de Replicação Completa

**IMPORTANTE**: Esta documentação cobre **APENAS o site principal** (sistema de gestão de clínica). **NÃO inclui** a Academy (plataforma de cursos).

---

## 📋 Visão Geral

**Stack**: Supabase PostgreSQL + Row Level Security (RLS)  
**Autenticação**: Supabase Auth  
**Segurança**: RLS ativo em todas as tabelas  
**Princípio**: Sistema baseado em roles (admin/user)

---

## 1. SISTEMA DE ROLES

### 1.1 Enum de Roles

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
```

### 1.2 Tabela: `user_roles`

**Função**: Atribuir roles a utilizadores autenticados

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);
```

**Campos**:
- `id`: UUID, PK
- `user_id`: FK para `auth.users`, CASCADE delete
- `role`: Enum `app_role` ('admin' ou 'user')
- `created_at`: Timestamp automático

**Índices**: Constraint UNIQUE em `(user_id, role)` previne duplicados

### 1.3 Função Core: `has_role()`

**Crítico**: Esta função é usada em **TODAS** as RLS policies

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

**Características**:
- `SECURITY DEFINER`: Executa com privilégios do owner (evita recursividade em RLS)
- `STABLE`: Otimização (resultado não muda na mesma transação)
- `SET search_path = public`: Segurança (evita hijacking de schema)

**Uso**: `has_role(auth.uid(), 'admin')` verifica se user atual é admin

### 1.4 RLS Policies - `user_roles`

```sql
-- Admins veem todas as roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users veem apenas as suas próprias roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

**Padrão**: RLS ativo, policies separadas para admins e users comuns

---

## 2. SISTEMA DE GESTÃO DE CLÍNICA

### 2.1 Enums do Sistema

```sql
-- Status de consultas
CREATE TYPE public.appointment_status AS ENUM (
  'scheduled',    -- Marcada
  'confirmed',    -- Confirmada
  'pre_confirmed',-- Pré-confirmada (adicionado depois)
  'waiting',      -- Em espera (check-in feito)
  'in_progress',  -- Em atendimento
  'completed',    -- Concluída
  'cancelled',    -- Cancelada
  'no_show'       -- Não compareceu
);

-- Prioridade na lista de espera
CREATE TYPE public.waitlist_priority AS ENUM ('low', 'medium', 'high');

-- Preferência de horário
CREATE TYPE public.time_preference AS ENUM ('morning', 'afternoon', 'any');
```

### 2.2 Tabela: `specialties` (Especialidades)

```sql
CREATE TABLE public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Seed Data**:
```sql
INSERT INTO public.specialties (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Oftalmologia'),
  ('22222222-2222-2222-2222-222222222222', 'Medicina Dentária');
```

**RLS**:
```sql
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage specialties" ON public.specialties
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2.3 Tabela: `consultation_types` (Tipos de Consulta)

```sql
CREATE TABLE public.consultation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  default_duration INTEGER NOT NULL DEFAULT 30, -- minutos
  color TEXT, -- Hex color para UI (#3b82f6)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Seed Data**:
```sql
INSERT INTO public.consultation_types (id, name, default_duration, color) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consulta Oftalmologia', 30, '#3b82f6'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cirurgia Cataratas', 60, '#8b5cf6'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cirurgia Refrativa', 45, '#06b6d4'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Consulta Dentária', 30, '#10b981'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ortodontia', 45, '#f59e0b'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Implantologia', 60, '#ef4444');
```

**RLS**:
```sql
ALTER TABLE public.consultation_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage consultation_types" ON public.consultation_types
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2.4 Tabela: `rooms` (Salas/Gabinetes)

```sql
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Seed Data**:
```sql
INSERT INTO public.rooms (id, name, specialty_id) VALUES
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'Gabinete 1', '11111111-1111-1111-1111-111111111111'),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'Gabinete 2', '22222222-2222-2222-2222-222222222222'),
  ('33333333-aaaa-aaaa-aaaa-333333333333', 'Gabinete 3', NULL);
```

**RLS**:
```sql
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rooms" ON public.rooms
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2.5 Tabela: `professionals` (Profissionais)

```sql
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6', -- Cor para agenda
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Seed Data**:
```sql
INSERT INTO public.professionals (id, name, specialty_id, color) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'Dr. António Silva', '11111111-1111-1111-1111-111111111111', '#3b82f6'),
  ('aaaa2222-2222-2222-2222-222222222222', 'Dra. Maria Santos', '11111111-1111-1111-1111-111111111111', '#8b5cf6'),
  ('aaaa3333-3333-3333-3333-333333333333', 'Dr. João Ferreira', '22222222-2222-2222-2222-222222222222', '#10b981'),
  ('aaaa4444-4444-4444-4444-444444444444', 'Dra. Ana Costa', '22222222-2222-2222-2222-222222222222', '#f59e0b'),
  ('aaaa5555-5555-5555-5555-555555555555', 'Dr. Pedro Oliveira', '22222222-2222-2222-2222-222222222222', '#ef4444');
```

**RLS**:
```sql
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage professionals" ON public.professionals
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2.6 Tabela: `patients` (Pacientes)

**Nota**: NIF é UNIQUE (identificador único do paciente)

```sql
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nif TEXT UNIQUE NOT NULL, -- NIF único obrigatório
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  birth_date DATE,
  notes TEXT,
  tags TEXT[], -- Array de tags
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para pesquisas rápidas por NIF
CREATE INDEX idx_patients_nif ON public.patients(nif);
```

**Trigger**: auto-update `updated_at` (ver secção 2.11)

**RLS**:
```sql
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage patients" ON public.patients
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2.7 Tabela: `appointments` (Consultas)

**Tabela central**: Relaciona paciente + profissional + tipo de consulta + horário

```sql
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
  consultation_type_id UUID NOT NULL REFERENCES public.consultation_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30, -- minutos
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_professional ON public.appointments(professional_id);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
```

**Trigger**: auto-update `updated_at` (ver secção 2.11)

**RLS**:
```sql
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage appointments" ON public.appointments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2.8 Tabela: `waitlist` (Lista de Espera)

**Função**: Gerir pacientes que aguardam vaga para consulta

```sql
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  time_preference public.time_preference NOT NULL DEFAULT 'any',
  preferred_dates DATE[], -- Array de datas preferidas
  priority public.waitlist_priority NOT NULL DEFAULT 'medium',
  sort_order INTEGER NOT NULL DEFAULT 0, -- Ordenação manual
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para queries de prioridade
CREATE INDEX idx_waitlist_priority ON public.waitlist(priority);
CREATE INDEX idx_waitlist_sort_order ON public.waitlist(sort_order);
```

**RLS**:
```sql
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage waitlist" ON public.waitlist
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2.9 Tabela: `clinic_settings` (Configurações)

**Função**: Armazenar configurações globais da clínica (horários, durações, etc.)

```sql
CREATE TABLE public.clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL, -- Dados em JSON
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Seed Data**:
```sql
INSERT INTO public.clinic_settings (key, value) VALUES
  ('working_hours', '{
    "monday": {"start": "09:00", "end": "18:00", "enabled": true},
    "tuesday": {"start": "09:00", "end": "18:00", "enabled": true},
    "wednesday": {"start": "09:00", "end": "18:00", "enabled": true},
    "thursday": {"start": "09:00", "end": "18:00", "enabled": true},
    "friday": {"start": "09:00", "end": "17:00", "enabled": true},
    "saturday": {"start": "09:00", "end": "13:00", "enabled": true},
    "sunday": {"start": "09:00", "end": "13:00", "enabled": false}
  }'),
  ('default_duration', '30'),
  ('buffer_between_appointments', '5');
```

**Trigger**: auto-update `updated_at` (ver secção 2.11)

**RLS**:
```sql
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage clinic_settings" ON public.clinic_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2.10 Tabela: `whatsapp_workflows` (Automações WhatsApp)

**Função**: Rastrear envio de mensagens automáticas (confirmações, lembretes, etc.)

```sql
CREATE TABLE public.whatsapp_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  phone TEXT NOT NULL,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN (
    'confirmation_24h',
    'review_reminder',
    'availability_suggestion'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent',
    'delivered',
    'responded',
    'expired',
    'cancelled'
  )),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  response TEXT,
  responded_at TIMESTAMPTZ,
  message_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para processar pending workflows
CREATE INDEX idx_whatsapp_workflows_pending 
  ON public.whatsapp_workflows(status, scheduled_at) 
  WHERE status = 'pending';

CREATE INDEX idx_whatsapp_workflows_appointment 
  ON public.whatsapp_workflows(appointment_id);
```

**Trigger**: auto-update `updated_at` (ver secção 2.11)

**RLS**:
```sql
ALTER TABLE public.whatsapp_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp_workflows"
  ON public.whatsapp_workflows
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

### 2.11 Função + Triggers: Auto-update `updated_at`

**Função universal** para atualizar `updated_at` automaticamente:

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

**Triggers aplicados a**:
```sql
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinic_settings_updated_at
  BEFORE UPDATE ON public.clinic_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_workflows_updated_at
  BEFORE UPDATE ON public.whatsapp_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 3. FORMULÁRIOS PÚBLICOS (Website)

**Característica**: Tabelas com INSERT público (anon + authenticated), mas apenas admins leem/editam

### 3.1 Tabela: `appointment_requests` (Pedidos de Consulta)

**Função**: Visitantes do site podem pedir consultas (sem login)

```sql
CREATE TABLE public.appointment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  nif TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('dentaria', 'oftalmologia')),
  preferred_date DATE NOT NULL,
  preferred_time TIME WITHOUT TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'rejected',
    'converted' -- Convertido em appointment real
  )),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID -- FK opcional para auth.users
);
```

**Trigger**: auto-update `updated_at`
```sql
CREATE TRIGGER update_appointment_requests_updated_at
  BEFORE UPDATE ON public.appointment_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

**RLS**:
```sql
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;

-- ✅ Qualquer pessoa (anon ou autenticada) pode submeter
CREATE POLICY "Anyone can submit appointment requests"
  ON public.appointment_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 🔒 Apenas admins podem ler/editar/deletar
CREATE POLICY "Admins can manage appointment requests"
  ON public.appointment_requests
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 3.2 Tabela: `contact_messages` (Mensagens de Contacto)

**Função**: Visitantes enviam mensagens via formulário de contacto

```sql
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**RLS**:
```sql
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ✅ Qualquer pessoa pode enviar mensagem
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 🔒 Apenas admins podem ler/editar/deletar
CREATE POLICY "Admins can manage contact messages"
  ON public.contact_messages
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

---

## 4. RESUMO DE TABELAS

| Tabela | Função | Auth Necessária | RLS |
|--------|--------|-----------------|-----|
| `user_roles` | Sistema de roles | ✅ | Admins veem todas, users veem próprias |
| `specialties` | Especialidades médicas | ✅ Admin | Admin-only |
| `consultation_types` | Tipos de consulta | ✅ Admin | Admin-only |
| `rooms` | Salas/gabinetes | ✅ Admin | Admin-only |
| `professionals` | Médicos/profissionais | ✅ Admin | Admin-only |
| `patients` | Pacientes | ✅ Admin | Admin-only |
| `appointments` | Consultas | ✅ Admin | Admin-only |
| `waitlist` | Lista de espera | ✅ Admin | Admin-only |
| `clinic_settings` | Configurações globais | ✅ Admin | Admin-only |
| `whatsapp_workflows` | Automações WhatsApp | ✅ Admin | Admin-only |
| `appointment_requests` | Pedidos públicos de consulta | ❌ Anyone (INSERT), ✅ Admin (resto) | Dual-policy |
| `contact_messages` | Mensagens de contacto | ❌ Anyone (INSERT), ✅ Admin (resto) | Dual-policy |

---

## 5. PADRÕES E BOAS PRÁTICAS

### 6.1 RLS Pattern

**Todas as tabelas têm**:
```sql
ALTER TABLE public.TABLE_NAME ENABLE ROW LEVEL SECURITY;
```

**Admin-only pattern**:
```sql
CREATE POLICY "Admins can manage TABLE_NAME" ON public.TABLE_NAME
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

**Public insert + admin manage**:
```sql
-- Policy 1: Public insert
CREATE POLICY "Anyone can submit" ON public.TABLE_NAME
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Admin manage
CREATE POLICY "Admins can manage" ON public.TABLE_NAME
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 6.2 Default Values Pattern

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at TIMESTAMPTZ NOT NULL DEFAULT now() -- Com trigger
```

### 6.3 Foreign Keys Pattern

```sql
-- Cascade delete (se parent apagado, child também)
patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE

-- Set null (se parent apagado, fica NULL)
specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL
```

### 6.4 Security Definer Pattern

**Todas as funções críticas** (como `has_role()`) usam:
```sql
SECURITY DEFINER
SET search_path = public
```

Previne:
- Recursividade em RLS checks
- SQL injection via schema hijacking

### 6.5 Índices Pattern

**Criar índices em**:
- Foreign keys (queries JOIN)
- Campos usados em WHERE (status, date, etc.)
- Campos UNIQUE (nif, slug, etc.)

```sql
CREATE INDEX idx_TABLE_FIELD ON public.TABLE(FIELD);

-- Índice parcial (apenas certos registos)
CREATE INDEX idx_whatsapp_workflows_pending 
  ON public.whatsapp_workflows(status, scheduled_at) 
  WHERE status = 'pending';
```

---

## 6. ORDEM DE CRIAÇÃO (Migration Steps)

**Importante**: Seguir esta ordem para evitar erros de dependências

### Step 1: Enums
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.appointment_status AS ENUM (...);
CREATE TYPE public.waitlist_priority AS ENUM (...);
CREATE TYPE public.time_preference AS ENUM (...);
```

### Step 2: Funções Core
```sql
CREATE FUNCTION public.has_role(...);
CREATE FUNCTION public.update_updated_at_column(...);
```

### Step 3: Tabela de Roles
```sql
CREATE TABLE public.user_roles (...);
-- + RLS + Policies
```

### Step 4: Tabelas Base (sem FKs entre elas)
```sql
CREATE TABLE public.specialties (...);
CREATE TABLE public.consultation_types (...);
-- + RLS + Policies
```

### Step 5: Tabelas com FKs para Base
```sql
CREATE TABLE public.rooms (...); -- FK to specialties
CREATE TABLE public.professionals (...); -- FK to specialties
CREATE TABLE public.patients (...); -- Sem FKs
-- + Índices + RLS + Policies
```

### Step 6: Tabelas com múltiplas FKs
```sql
CREATE TABLE public.appointments (...); -- FK to patients, professionals, etc.
CREATE TABLE public.waitlist (...);
-- + Índices + Triggers + RLS + Policies
```

### Step 7: Tabelas Auxiliares
```sql
CREATE TABLE public.clinic_settings (...);
CREATE TABLE public.whatsapp_workflows (...);
CREATE TABLE public.appointment_requests (...);
CREATE TABLE public.contact_messages (...);
-- + Triggers + RLS + Policies
```

### Step 8: Seed Data
```sql
INSERT INTO public.specialties ...;
INSERT INTO public.consultation_types ...;
INSERT INTO public.rooms ...;
INSERT INTO public.professionals ...;
INSERT INTO public.clinic_settings ...;
```

### Step 9: Alterações Posteriores (se necessário)
```sql
-- Exemplo: adicionar valor a enum existente
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'pre_confirmed';
```

---

## 7. CHECKLIST DE REPLICAÇÃO

Para criar este backend noutro projeto:

- [ ] **Criar enums** (app_role, appointment_status, waitlist_priority, time_preference)
- [ ] **Criar função `has_role()`** (SECURITY DEFINER, SET search_path)
- [ ] **Criar função `update_updated_at_column()`**
- [ ] **Criar tabela `user_roles`** + RLS + Policies
- [ ] **Criar tabelas base** (specialties, consultation_types) + RLS + Seed
- [ ] **Criar tabelas com FKs simples** (rooms, professionals, patients) + RLS + Índices
- [ ] **Criar tabela `appointments`** + Índices + Triggers + RLS
- [ ] **Criar tabela `waitlist`** + Índices + RLS
- [ ] **Criar tabela `clinic_settings`** + Triggers + RLS + Seed
- [ ] **Criar tabela `whatsapp_workflows`** + Índices + Triggers + RLS
- [ ] **Criar tabela `appointment_requests`** + Triggers + RLS (dual-policy)
- [ ] **Criar tabela `contact_messages`** + RLS (dual-policy)
- [ ] **Inserir seed data** (especialidades, tipos de consulta, profissionais, salas, settings)
- [ ] **Testar RLS** (criar admin user via `user_roles`, tentar queries)
- [ ] **Testar formulários públicos** (INSERT sem auth)

---

## 8. CONFIGURAÇÃO INICIAL PÓS-MIGRATIONS

### 8.1 Criar Primeiro Admin

**Após signup do primeiro user**:

1. Obter UUID do user:
```sql
SELECT id, email FROM auth.users;
```

2. Adicionar role admin:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_AQUI', 'admin');
```

### 8.2 Validar RLS

**Como admin**:
```sql
SELECT * FROM public.patients; -- Deve funcionar
SELECT * FROM public.appointments; -- Deve funcionar
```

**Como user normal** (ou anon):
```sql
SELECT * FROM public.patients; -- Deve falhar (RLS block)
```

**Como anon**:
```sql
INSERT INTO public.appointment_requests (...); -- Deve funcionar
INSERT INTO public.patients (...); -- Deve falhar
```



---

## 9. NOTAS IMPORTANTES

### ⚠️ Security Definer
Todas as funções RLS usam `SECURITY DEFINER` para evitar recursividade infinita (função chama RLS que chama função...).

### ⚠️ Search Path
`SET search_path = public` previne SQL injection via schema hijacking.

### ⚠️ Unique Constraints
- `patients.nif`: Previne duplicados de pacientes
- `clinic_settings.key`: Apenas 1 entry por configuração

### ⚠️ Cascade Deletes
- Appointments CASCADE quando patient/professional apagado
- Waitlist CASCADE quando patient apagado
- WhatsApp workflows CASCADE quando appointment apagado

### ⚠️ Enums Imutáveis
Para adicionar valores a enums existentes:
```sql
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'new_status';
```

**Não é possível remover valores de enums** (apenas criar novo enum e migrar).

---

## 10. SQL COMPLETO CONSOLIDADO

```sql
-- =============================================
-- MEDIFRANCO BACKEND - FULL REPLICATION SCRIPT
-- =============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.appointment_status AS ENUM (
  'scheduled', 'confirmed', 'pre_confirmed', 'waiting', 
  'in_progress', 'completed', 'cancelled', 'no_show'
);
CREATE TYPE public.waitlist_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.time_preference AS ENUM ('morning', 'afternoon', 'any');

-- 2. CORE FUNCTIONS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 4. BASE TABLES
CREATE TABLE public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage specialties" ON public.specialties FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.consultation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  default_duration INTEGER NOT NULL DEFAULT 30,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consultation_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage consultation_types" ON public.consultation_types FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. TABLES WITH FKs
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage rooms" ON public.rooms FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage professionals" ON public.professionals FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nif TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  birth_date DATE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_patients_nif ON public.patients(nif);
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage patients" ON public.patients FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 6. APPOINTMENTS
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
  consultation_type_id UUID NOT NULL REFERENCES public.consultation_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_professional ON public.appointments(professional_id);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage appointments" ON public.appointments FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 7. WAITLIST
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  time_preference public.time_preference NOT NULL DEFAULT 'any',
  preferred_dates DATE[],
  priority public.waitlist_priority NOT NULL DEFAULT 'medium',
  sort_order INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_waitlist_priority ON public.waitlist(priority);
CREATE INDEX idx_waitlist_sort_order ON public.waitlist(sort_order);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage waitlist" ON public.waitlist FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 8. CLINIC SETTINGS
CREATE TABLE public.clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER update_clinic_settings_updated_at BEFORE UPDATE ON public.clinic_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage clinic_settings" ON public.clinic_settings FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 9. WHATSAPP WORKFLOWS
CREATE TABLE public.whatsapp_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  phone TEXT NOT NULL,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('confirmation_24h', 'review_reminder', 'availability_suggestion')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'responded', 'expired', 'cancelled')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  response TEXT,
  responded_at TIMESTAMPTZ,
  message_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_whatsapp_workflows_pending ON public.whatsapp_workflows(status, scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_whatsapp_workflows_appointment ON public.whatsapp_workflows(appointment_id);
CREATE TRIGGER update_whatsapp_workflows_updated_at BEFORE UPDATE ON public.whatsapp_workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.whatsapp_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage whatsapp_workflows" ON public.whatsapp_workflows FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 10. PUBLIC FORMS
CREATE TABLE public.appointment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  nif TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('dentaria', 'oftalmologia')),
  preferred_date DATE NOT NULL,
  preferred_time TIME WITHOUT TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID
);
CREATE TRIGGER update_appointment_requests_updated_at BEFORE UPDATE ON public.appointment_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit appointment requests" ON public.appointment_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage appointment requests" ON public.appointment_requests FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 11. SEED DATA
INSERT INTO public.specialties (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Oftalmologia'),
  ('22222222-2222-2222-2222-222222222222', 'Medicina Dentária');

INSERT INTO public.consultation_types (id, name, default_duration, color) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consulta Oftalmologia', 30, '#3b82f6'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cirurgia Cataratas', 60, '#8b5cf6'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cirurgia Refrativa', 45, '#06b6d4'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Consulta Dentária', 30, '#10b981'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ortodontia', 45, '#f59e0b'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Implantologia', 60, '#ef4444');

INSERT INTO public.rooms (id, name, specialty_id) VALUES
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'Gabinete 1', '11111111-1111-1111-1111-111111111111'),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'Gabinete 2', '22222222-2222-2222-2222-222222222222'),
  ('33333333-aaaa-aaaa-aaaa-333333333333', 'Gabinete 3', NULL);

INSERT INTO public.professionals (id, name, specialty_id, color) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'Dr. António Silva', '11111111-1111-1111-1111-111111111111', '#3b82f6'),
  ('aaaa2222-2222-2222-2222-222222222222', 'Dra. Maria Santos', '11111111-1111-1111-1111-111111111111', '#8b5cf6'),
  ('aaaa3333-3333-3333-3333-333333333333', 'Dr. João Ferreira', '22222222-2222-2222-2222-222222222222', '#10b981'),
  ('aaaa4444-4444-4444-4444-444444444444', 'Dra. Ana Costa', '22222222-2222-2222-2222-222222222222', '#f59e0b'),
  ('aaaa5555-5555-5555-5555-555555555555', 'Dr. Pedro Oliveira', '22222222-2222-2222-2222-222222222222', '#ef4444');

INSERT INTO public.clinic_settings (key, value) VALUES
  ('working_hours', '{"monday": {"start": "09:00", "end": "18:00", "enabled": true}, "tuesday": {"start": "09:00", "end": "18:00", "enabled": true}, "wednesday": {"start": "09:00", "end": "18:00", "enabled": true}, "thursday": {"start": "09:00", "end": "18:00", "enabled": true}, "friday": {"start": "09:00", "end": "17:00", "enabled": true}, "saturday": {"start": "09:00", "end": "13:00", "enabled": true}, "sunday": {"start": "09:00", "end": "13:00", "enabled": false}}'),
  ('default_duration', '30'),
  ('buffer_between_appointments', '5');

-- =============================================
-- END OF SCRIPT
-- =============================================
```

---

## FIM

Este documento contém **TODA a lógica de backend** do site principal MediFranco. **Não inclui** nada da Academy (que está em schema/migrations separados).

Copy-paste este script SQL para criar a base de dados completa noutro projeto. ✅
