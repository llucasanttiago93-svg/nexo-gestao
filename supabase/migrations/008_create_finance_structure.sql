-- =========================================================
-- NEXO GESTÃO
-- MIGRATION 008
-- ESTRUTURA DO NOVO MÓDULO FINANCEIRO
--
-- Referência funcional: Bling
--
-- IMPORTANTE:
-- As tabelas desta migration já foram criadas no projeto
-- Supabase durante a construção inicial do módulo.
-- Este arquivo registra a estrutura no repositório.
-- =========================================================


-- =========================================================
-- 1. CONTAS FINANCEIRAS
-- =========================================================

create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null,

  type text not null
    check (
      type in (
        'cash',
        'bank',
        'digital_account',
        'credit_card'
      )
    ),

  bank_name text,

  account_number text,

  initial_balance numeric(12,2) not null default 0,

  current_balance numeric(12,2) not null default 0,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- =========================================================
-- 2. CATEGORIAS FINANCEIRAS
-- =========================================================

create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null,

  type text not null
    check (
      type in (
        'income',
        'expense',
        'both'
      )
    ),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- =========================================================
-- 3. CONTAS A RECEBER
-- =========================================================

create table if not exists public.accounts_receivable (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  customer_id uuid
    references public.customers(id)
    on delete set null,

  order_id uuid
    references public.orders(id)
    on delete set null,

  description text not null,

  category_id uuid
    references public.finance_categories(id)
    on delete set null,

  total_amount numeric(12,2) not null
    check (total_amount >= 0),

  status text not null default 'open'
    check (
      status in (
        'open',
        'partially_paid',
        'paid',
        'overdue',
        'cancelled',
        'refunded'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- =========================================================
-- 4. PARCELAS DE CONTAS A RECEBER
-- =========================================================

create table if not exists public.accounts_receivable_installments (
  id uuid primary key default gen_random_uuid(),

  receivable_id uuid not null
    references public.accounts_receivable(id)
    on delete cascade,

  installment_number integer not null,

  due_date date not null,

  amount numeric(12,2) not null
    check (amount >= 0),

  paid_amount numeric(12,2) not null default 0
    check (paid_amount >= 0),

  status text not null default 'open'
    check (
      status in (
        'open',
        'partially_paid',
        'paid',
        'overdue',
        'cancelled',
        'refunded'
      )
    ),

  payment_method text,

  paid_at timestamptz,

  financial_account_id uuid
    references public.finance_accounts(id)
    on delete set null,

  notes text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique (
    receivable_id,
    installment_number
  )
);


-- =========================================================
-- 5. CONTAS A PAGAR
-- =========================================================

create table if not exists public.accounts_payable (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  description text not null,

  category_id uuid
    references public.finance_categories(id)
    on delete set null,

  total_amount numeric(12,2) not null
    check (total_amount >= 0),

  status text not null default 'open'
    check (
      status in (
        'open',
        'partially_paid',
        'paid',
        'overdue',
        'cancelled'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- =========================================================
-- 6. PARCELAS DE CONTAS A PAGAR
-- =========================================================

create table if not exists public.accounts_payable_installments (
  id uuid primary key default gen_random_uuid(),

  payable_id uuid not null
    references public.accounts_payable(id)
    on delete cascade,

  installment_number integer not null,

  due_date date not null,

  amount numeric(12,2) not null
    check (amount >= 0),

  paid_amount numeric(12,2) not null default 0
    check (paid_amount >= 0),

  status text not null default 'open'
    check (
      status in (
        'open',
        'partially_paid',
        'paid',
        'overdue',
        'cancelled'
      )
    ),

  payment_method text,

  paid_at timestamptz,

  financial_account_id uuid
    references public.finance_accounts(id)
    on delete set null,

  notes text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique (
    payable_id,
    installment_number
  )
);


-- =========================================================
-- 7. MOVIMENTAÇÕES DE CAIXA
-- =========================================================

create table if not exists public.cash_movements (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  financial_account_id uuid not null
    references public.finance_accounts(id)
    on delete restrict,

  type text not null
    check (
      type in (
        'income',
        'expense'
      )
    ),

  description text not null,

  amount numeric(12,2) not null
    check (amount > 0),

  movement_date date not null,

  category_id uuid
    references public.finance_categories(id)
    on delete set null,

  order_id uuid
    references public.orders(id)
    on delete set null,

  receivable_installment_id uuid
    references public.accounts_receivable_installments(id)
    on delete set null,

  payable_installment_id uuid
    references public.accounts_payable_installments(id)
    on delete set null,

  status text not null default 'completed'
    check (
      status in (
        'completed',
        'cancelled'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- =========================================================
-- 8. ÍNDICES
-- =========================================================

create index if not exists idx_finance_accounts_user
on public.finance_accounts(user_id);

create index if not exists idx_finance_categories_user
on public.finance_categories(user_id);

create index if not exists idx_accounts_receivable_user
on public.accounts_receivable(user_id);

create index if not exists idx_accounts_receivable_customer
on public.accounts_receivable(customer_id);

create index if not exists idx_accounts_receivable_order
on public.accounts_receivable(order_id);

create index if not exists idx_receivable_installments_receivable
on public.accounts_receivable_installments(receivable_id);

create index if not exists idx_receivable_installments_due_date
on public.accounts_receivable_installments(due_date);

create index if not exists idx_accounts_payable_user
on public.accounts_payable(user_id);

create index if not exists idx_payable_installments_payable
on public.accounts_payable_installments(payable_id);

create index if not exists idx_payable_installments_due_date
on public.accounts_payable_installments(due_date);

create index if not exists idx_cash_movements_user
on public.cash_movements(user_id);

create index if not exists idx_cash_movements_account
on public.cash_movements(financial_account_id);

create index if not exists idx_cash_movements_date
on public.cash_movements(movement_date);

create index if not exists idx_cash_movements_order
on public.cash_movements(order_id);


-- =========================================================
-- 9. PROTEÇÕES CONTRA DUPLICIDADE
-- =========================================================

create unique index if not exists
idx_unique_cash_receivable_installment
on public.cash_movements(receivable_installment_id)
where receivable_installment_id is not null;

create unique index if not exists
idx_unique_cash_payable_installment
on public.cash_movements(payable_installment_id)
where payable_installment_id is not null;

create unique index if not exists
idx_finance_accounts_user_name
on public.finance_accounts(user_id, name);

create unique index if not exists
idx_finance_categories_user_name
on public.finance_categories(user_id, name);