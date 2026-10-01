-- ============================================================
-- 010_create_organizations.sql
-- Multi-tenancy: organizações e membros
-- ============================================================

-- ============================================================
-- 1. ORGANIZATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    document text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 2. ORGANIZATION MEMBERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_members (
    organization_id uuid NOT NULL
        REFERENCES public.organizations(id)
        ON DELETE CASCADE,

    user_id uuid NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    role text NOT NULL DEFAULT 'owner',

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (organization_id, user_id)
);


-- ============================================================
-- 3. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_organization_members_user_id
    ON public.organization_members(user_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id
    ON public.organization_members(organization_id);


-- ============================================================
-- 4. CRIAR UMA ORGANIZAÇÃO PARA CADA USUÁRIO EXISTENTE
--
-- A organização é criada somente para usuários que ainda
-- não possuem membership.
-- ============================================================

DO $$
DECLARE
    v_user record;
    v_organization_id uuid;
    v_company_name text;
    v_document text;
BEGIN

    FOR v_user IN
        SELECT u.id
        FROM auth.users u
        WHERE NOT EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.user_id = u.id
        )
    LOOP

        SELECT
            NULLIF(trim(cp.name), ''),
            NULLIF(trim(cp.document), '')
        INTO
            v_company_name,
            v_document
        FROM public.company_profiles cp
        WHERE cp.user_id = v_user.id
        LIMIT 1;

        v_organization_id := gen_random_uuid();

        INSERT INTO public.organizations (
            id,
            name,
            document
        )
        VALUES (
            v_organization_id,
            COALESCE(v_company_name, 'Minha empresa'),
            v_document
        );

        INSERT INTO public.organization_members (
            organization_id,
            user_id,
            role
        )
        VALUES (
            v_organization_id,
            v_user.id,
            'owner'
        );

    END LOOP;

END $$;


-- ============================================================
-- 5. ADICIONAR organization_id ÀS TABELAS DE NEGÓCIO
--
-- Nesta etapa as colunas continuam NULLABLE.
-- O user_id antigo será mantido temporariamente.
-- ============================================================

ALTER TABLE public.company_profiles
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.company_preferences
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.order_items
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.finance_accounts
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.finance_categories
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.accounts_receivable
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.accounts_receivable_installments
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.accounts_payable
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.accounts_payable_installments
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.cash_movements
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS organization_id uuid;


-- ============================================================
-- 6. MIGRAR DADOS EXISTENTES
--
-- Cada registro recebe a organização do seu usuário atual.
-- ============================================================

UPDATE public.company_profiles cp
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = cp.user_id
  AND cp.organization_id IS NULL;


UPDATE public.company_preferences cp
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = cp.user_id
  AND cp.organization_id IS NULL;


UPDATE public.categories c
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = c.user_id
  AND c.organization_id IS NULL;


UPDATE public.customers c
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = c.user_id
  AND c.organization_id IS NULL;


UPDATE public.products p
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = p.user_id
  AND p.organization_id IS NULL;


UPDATE public.orders o
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = o.user_id
  AND o.organization_id IS NULL;


UPDATE public.order_items oi
SET organization_id = o.organization_id
FROM public.orders o
WHERE o.id = oi.order_id
  AND oi.organization_id IS NULL;


UPDATE public.finance_accounts fa
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = fa.user_id
  AND fa.organization_id IS NULL;


UPDATE public.finance_categories fc
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = fc.user_id
  AND fc.organization_id IS NULL;


UPDATE public.accounts_receivable ar
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = ar.user_id
  AND ar.organization_id IS NULL;


UPDATE public.accounts_receivable_installments ari
SET organization_id = ar.organization_id
FROM public.accounts_receivable ar
WHERE ar.id = ari.receivable_id
  AND ari.organization_id IS NULL;


UPDATE public.accounts_payable ap
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = ap.user_id
  AND ap.organization_id IS NULL;


UPDATE public.accounts_payable_installments api
SET organization_id = ap.organization_id
FROM public.accounts_payable ap
WHERE ap.id = api.payable_id
  AND api.organization_id IS NULL;


UPDATE public.cash_movements cm
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = cm.user_id
  AND cm.organization_id IS NULL;


UPDATE public.transactions t
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE om.user_id = t.user_id
  AND t.organization_id IS NULL;


-- ============================================================
-- 7. FOREIGN KEYS
-- ============================================================

ALTER TABLE public.company_profiles
    DROP CONSTRAINT IF EXISTS company_profiles_organization_id_fkey;

ALTER TABLE public.company_profiles
    ADD CONSTRAINT company_profiles_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.company_preferences
    DROP CONSTRAINT IF EXISTS company_preferences_organization_id_fkey;

ALTER TABLE public.company_preferences
    ADD CONSTRAINT company_preferences_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.categories
    DROP CONSTRAINT IF EXISTS categories_organization_id_fkey;

ALTER TABLE public.categories
    ADD CONSTRAINT categories_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.customers
    DROP CONSTRAINT IF EXISTS customers_organization_id_fkey;

ALTER TABLE public.customers
    ADD CONSTRAINT customers_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.products
    DROP CONSTRAINT IF EXISTS products_organization_id_fkey;

ALTER TABLE public.products
    ADD CONSTRAINT products_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.orders
    DROP CONSTRAINT IF EXISTS orders_organization_id_fkey;

ALTER TABLE public.orders
    ADD CONSTRAINT orders_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.order_items
    DROP CONSTRAINT IF EXISTS order_items_organization_id_fkey;

ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.finance_accounts
    DROP CONSTRAINT IF EXISTS finance_accounts_organization_id_fkey;

ALTER TABLE public.finance_accounts
    ADD CONSTRAINT finance_accounts_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.finance_categories
    DROP CONSTRAINT IF EXISTS finance_categories_organization_id_fkey;

ALTER TABLE public.finance_categories
    ADD CONSTRAINT finance_categories_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.accounts_receivable
    DROP CONSTRAINT IF EXISTS accounts_receivable_organization_id_fkey;

ALTER TABLE public.accounts_receivable
    ADD CONSTRAINT accounts_receivable_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.accounts_receivable_installments
    DROP CONSTRAINT IF EXISTS accounts_receivable_installments_organization_id_fkey;

ALTER TABLE public.accounts_receivable_installments
    ADD CONSTRAINT accounts_receivable_installments_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.accounts_payable
    DROP CONSTRAINT IF EXISTS accounts_payable_organization_id_fkey;

ALTER TABLE public.accounts_payable
    ADD CONSTRAINT accounts_payable_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.accounts_payable_installments
    DROP CONSTRAINT IF EXISTS accounts_payable_installments_organization_id_fkey;

ALTER TABLE public.accounts_payable_installments
    ADD CONSTRAINT accounts_payable_installments_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.cash_movements
    DROP CONSTRAINT IF EXISTS cash_movements_organization_id_fkey;

ALTER TABLE public.cash_movements
    ADD CONSTRAINT cash_movements_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


ALTER TABLE public.transactions
    DROP CONSTRAINT IF EXISTS transactions_organization_id_fkey;

ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;


-- ============================================================
-- 8. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_company_profiles_organization_id
    ON public.company_profiles(organization_id);

CREATE INDEX IF NOT EXISTS idx_company_preferences_organization_id
    ON public.company_preferences(organization_id);

CREATE INDEX IF NOT EXISTS idx_categories_organization_id
    ON public.categories(organization_id);

CREATE INDEX IF NOT EXISTS idx_customers_organization_id
    ON public.customers(organization_id);

CREATE INDEX IF NOT EXISTS idx_products_organization_id
    ON public.products(organization_id);

CREATE INDEX IF NOT EXISTS idx_orders_organization_id
    ON public.orders(organization_id);

CREATE INDEX IF NOT EXISTS idx_order_items_organization_id
    ON public.order_items(organization_id);

CREATE INDEX IF NOT EXISTS idx_finance_accounts_organization_id
    ON public.finance_accounts(organization_id);

CREATE INDEX IF NOT EXISTS idx_finance_categories_organization_id
    ON public.finance_categories(organization_id);

CREATE INDEX IF NOT EXISTS idx_accounts_receivable_organization_id
    ON public.accounts_receivable(organization_id);

CREATE INDEX IF NOT EXISTS idx_accounts_receivable_installments_organization_id
    ON public.accounts_receivable_installments(organization_id);

CREATE INDEX IF NOT EXISTS idx_accounts_payable_organization_id
    ON public.accounts_payable(organization_id);

CREATE INDEX IF NOT EXISTS idx_accounts_payable_installments_organization_id
    ON public.accounts_payable_installments(organization_id);

CREATE INDEX IF NOT EXISTS idx_cash_movements_organization_id
    ON public.cash_movements(organization_id);

CREATE INDEX IF NOT EXISTS idx_transactions_organization_id
    ON public.transactions(organization_id);


-- ============================================================
-- 9. RLS DAS NOVAS TABELAS
--
-- As tabelas antigas continuam com o RLS atual nesta etapa.
-- A migração completa do RLS será feita depois.
-- ============================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users can view their organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.organization_members om
        WHERE om.organization_id = organizations.id
          AND om.user_id = auth.uid()
    )
);


CREATE POLICY "Users can view their memberships"
ON public.organization_members
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);


-- ============================================================
-- FIM DA MIGRATION 010
-- ============================================================