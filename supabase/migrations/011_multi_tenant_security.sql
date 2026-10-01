-- ============================================================
-- 011_multi_tenant_security.sql
-- Segurança multi-tenant por organização
--
-- Objetivo:
-- 1. Centralizar a descoberta da organização do usuário
-- 2. Migrar o RLS das tabelas de negócio para organization_id
-- 3. Manter user_id durante a fase de transição
-- 4. Impedir acesso entre organizações
-- 5. Ainda NÃO alterar as RPCs SECURITY DEFINER
-- ============================================================


-- ============================================================
-- 1. FUNÇÃO: ORGANIZAÇÃO DO USUÁRIO AUTENTICADO
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT om.organization_id
    FROM public.organization_members om
    WHERE om.user_id = auth.uid()
    ORDER BY om.created_at
    LIMIT 1;
$$;


-- ============================================================
-- 2. PERMISSÕES DA FUNÇÃO
-- ============================================================

REVOKE ALL
ON FUNCTION public.get_user_organization_id()
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.get_user_organization_id()
TO authenticated;


-- ============================================================
-- 3. ORGANIZATIONS
-- ============================================================

DROP POLICY IF EXISTS "Users can view their organizations"
ON public.organizations;

CREATE POLICY "Users can view their organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (
    id = public.get_user_organization_id()
);


-- ============================================================
-- 4. ORGANIZATION MEMBERS
-- ============================================================

DROP POLICY IF EXISTS "Users can view their memberships"
ON public.organization_members;

CREATE POLICY "Users can view their memberships"
ON public.organization_members
FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
    AND user_id = auth.uid()
);


-- ============================================================
-- 5. COMPANY PROFILES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own company profile"
ON public.company_profiles;

DROP POLICY IF EXISTS "Users can insert own company profile"
ON public.company_profiles;

DROP POLICY IF EXISTS "Users can update own company profile"
ON public.company_profiles;

DROP POLICY IF EXISTS "Users can delete own company profile"
ON public.company_profiles;


CREATE POLICY "Users can view company profile"
ON public.company_profiles
FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can insert company profile"
ON public.company_profiles
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can update company profile"
ON public.company_profiles
FOR UPDATE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can delete company profile"
ON public.company_profiles
FOR DELETE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 6. COMPANY PREFERENCES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own company preferences"
ON public.company_preferences;

DROP POLICY IF EXISTS "Users can insert own company preferences"
ON public.company_preferences;

DROP POLICY IF EXISTS "Users can update own company preferences"
ON public.company_preferences;

DROP POLICY IF EXISTS "Users can delete own company preferences"
ON public.company_preferences;


CREATE POLICY "Users can view company preferences"
ON public.company_preferences
FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can insert company preferences"
ON public.company_preferences
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can update company preferences"
ON public.company_preferences
FOR UPDATE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can delete company preferences"
ON public.company_preferences
FOR DELETE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 7. CATEGORIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own categories"
ON public.categories;

DROP POLICY IF EXISTS "Users can create their own categories"
ON public.categories;

DROP POLICY IF EXISTS "Users can update their own categories"
ON public.categories;

DROP POLICY IF EXISTS "Users can delete their own categories"
ON public.categories;


CREATE POLICY "Users can view organization categories"
ON public.categories
FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can create organization categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can update organization categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can delete organization categories"
ON public.categories
FOR DELETE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 8. CUSTOMERS
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own customers"
ON public.customers;

DROP POLICY IF EXISTS "Users can create their own customers"
ON public.customers;

DROP POLICY IF EXISTS "Users can update their own customers"
ON public.customers;

DROP POLICY IF EXISTS "Users can delete their own customers"
ON public.customers;


CREATE POLICY "Users can view organization customers"
ON public.customers
FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can create organization customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can update organization customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can delete organization customers"
ON public.customers
FOR DELETE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 9. PRODUCTS
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own products"
ON public.products;

DROP POLICY IF EXISTS "Users can create their own products"
ON public.products;

DROP POLICY IF EXISTS "Users can update their own products"
ON public.products;

DROP POLICY IF EXISTS "Users can delete their own products"
ON public.products;


CREATE POLICY "Users can view organization products"
ON public.products
FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can create organization products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can update organization products"
ON public.products
FOR UPDATE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can delete organization products"
ON public.products
FOR DELETE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 10. ORDERS
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own orders"
ON public.orders;

DROP POLICY IF EXISTS "Users can create their own orders"
ON public.orders;

DROP POLICY IF EXISTS "Users can update their own orders"
ON public.orders;

DROP POLICY IF EXISTS "Users can delete their own orders"
ON public.orders;


CREATE POLICY "Users can view organization orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can create organization orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can update organization orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can delete organization orders"
ON public.orders
FOR DELETE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 11. ORDER ITEMS
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own order items"
ON public.order_items;

DROP POLICY IF EXISTS "Users can create their own order items"
ON public.order_items;

DROP POLICY IF EXISTS "Users can update their own order items"
ON public.order_items;

DROP POLICY IF EXISTS "Users can delete their own order items"
ON public.order_items;


CREATE POLICY "Users can view organization order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can create organization order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can update organization order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can delete organization order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 12. FINANCE ACCOUNTS
-- ============================================================

DROP POLICY IF EXISTS "Users can manage own finance accounts"
ON public.finance_accounts;


CREATE POLICY "Users can manage organization finance accounts"
ON public.finance_accounts
FOR ALL
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 13. FINANCE CATEGORIES
-- ============================================================

DROP POLICY IF EXISTS "Users can manage own finance categories"
ON public.finance_categories;


CREATE POLICY "Users can manage organization finance categories"
ON public.finance_categories
FOR ALL
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 14. ACCOUNTS RECEIVABLE
-- ============================================================

DROP POLICY IF EXISTS "Users can manage own receivables"
ON public.accounts_receivable;


CREATE POLICY "Users can manage organization receivables"
ON public.accounts_receivable
FOR ALL
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 15. ACCOUNTS RECEIVABLE INSTALLMENTS
-- ============================================================

DROP POLICY IF EXISTS "Users can manage own receivable installments"
ON public.accounts_receivable_installments;


CREATE POLICY "Users can manage organization receivable installments"
ON public.accounts_receivable_installments
FOR ALL
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 16. ACCOUNTS PAYABLE
-- ============================================================

DROP POLICY IF EXISTS "Users can manage own payables"
ON public.accounts_payable;


CREATE POLICY "Users can manage organization payables"
ON public.accounts_payable
FOR ALL
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 17. ACCOUNTS PAYABLE INSTALLMENTS
-- ============================================================

DROP POLICY IF EXISTS "Users can manage own payable installments"
ON public.accounts_payable_installments;


CREATE POLICY "Users can manage organization payable installments"
ON public.accounts_payable_installments
FOR ALL
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 18. CASH MOVEMENTS
-- ============================================================

DROP POLICY IF EXISTS "Users can manage own cash movements"
ON public.cash_movements;


CREATE POLICY "Users can manage organization cash movements"
ON public.cash_movements
FOR ALL
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 19. TRANSACTIONS
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own transactions"
ON public.transactions;

DROP POLICY IF EXISTS "Users can create their own transactions"
ON public.transactions;

DROP POLICY IF EXISTS "Users can update their own transactions"
ON public.transactions;

DROP POLICY IF EXISTS "Users can delete their own transactions"
ON public.transactions;


CREATE POLICY "Users can view organization transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can create organization transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can update organization transactions"
ON public.transactions
FOR UPDATE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
);


CREATE POLICY "Users can delete organization transactions"
ON public.transactions
FOR DELETE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
);


-- ============================================================
-- 20. PROFILES
--
-- Profiles continuam pertencendo diretamente ao usuário.
-- Não fazem parte do tenant de negócio.
-- ============================================================

-- Nenhuma alteração nas policies de profiles.


-- ============================================================
-- FIM DA MIGRATION 011
-- ============================================================