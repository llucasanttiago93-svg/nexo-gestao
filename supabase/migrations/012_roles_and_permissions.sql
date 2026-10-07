-- ============================================================
-- 012_roles_and_permissions.sql
-- Nexo Gestão
--
-- Sistema de papéis e permissões por organização
-- ============================================================


-- ============================================================
-- 1. ROLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    name text NOT NULL,
    slug text NOT NULL,

    description text,

    is_system boolean NOT NULL DEFAULT true,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE (slug)
);


-- ============================================================
-- 2. PERMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    module text NOT NULL,
    action text NOT NULL,

    name text NOT NULL,
    description text,

    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE (module, action)
);


-- ============================================================
-- 3. ROLE PERMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id uuid NOT NULL
        REFERENCES public.roles(id)
        ON DELETE CASCADE,

    permission_id uuid NOT NULL
        REFERENCES public.permissions(id)
        ON DELETE CASCADE,

    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (role_id, permission_id)
);


-- ============================================================
-- 4. ORGANIZATION MEMBERS
--
-- Mantemos a tabela existente e adicionamos role_id.
-- O campo role antigo continua temporariamente para
-- compatibilidade durante a migração.
-- ============================================================

ALTER TABLE public.organization_members
ADD COLUMN IF NOT EXISTS role_id uuid;


-- ============================================================
-- 5. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_roles_slug
    ON public.roles(slug);

CREATE INDEX IF NOT EXISTS idx_permissions_module_action
    ON public.permissions(module, action);

CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id
    ON public.role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_role_id
    ON public.organization_members(role_id);


-- ============================================================
-- 6. ROLES PADRÃO
-- ============================================================

INSERT INTO public.roles (
    name,
    slug,
    description,
    is_system
)
VALUES
    (
        'Proprietário',
        'owner',
        'Dono da organização com acesso total.',
        true
    ),
    (
        'Administrador',
        'admin',
        'Administra a operação e os usuários da organização.',
        true
    ),
    (
        'Vendedor',
        'sales',
        'Acesso à operação comercial e aos pedidos.',
        true
    ),
    (
        'Financeiro',
        'finance',
        'Acesso às operações financeiras.',
        true
    ),
    (
        'Estoquista',
        'inventory',
        'Acesso à operação de estoque e produtos.',
        true
    )
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 7. PERMISSÕES PADRÃO
-- ============================================================

INSERT INTO public.permissions (
    module,
    action,
    name,
    description
)
VALUES

    -- USUÁRIOS
    ('users', 'view', 'Visualizar usuários', 'Visualizar usuários da organização.'),
    ('users', 'invite', 'Convidar usuários', 'Convidar novos usuários para a organização.'),
    ('users', 'edit', 'Editar usuários', 'Editar dados, papéis e permissões de usuários.'),
    ('users', 'remove', 'Remover usuários', 'Remover usuários da organização.'),

    -- CLIENTES
    ('customers', 'view', 'Visualizar clientes', 'Visualizar clientes.'),
    ('customers', 'create', 'Criar clientes', 'Cadastrar clientes.'),
    ('customers', 'edit', 'Editar clientes', 'Editar clientes.'),
    ('customers', 'delete', 'Excluir clientes', 'Excluir clientes.'),

    -- PRODUTOS
    ('products', 'view', 'Visualizar produtos', 'Visualizar produtos.'),
    ('products', 'create', 'Criar produtos', 'Cadastrar produtos.'),
    ('products', 'edit', 'Editar produtos', 'Editar produtos.'),
    ('products', 'delete', 'Excluir produtos', 'Excluir produtos.'),

    -- PEDIDOS
    ('orders', 'view', 'Visualizar pedidos', 'Visualizar pedidos.'),
    ('orders', 'create', 'Criar pedidos', 'Criar pedidos.'),
    ('orders', 'edit', 'Editar pedidos', 'Editar pedidos.'),
    ('orders', 'cancel', 'Cancelar pedidos', 'Cancelar pedidos.'),

    -- FINANCEIRO
    ('finance', 'view', 'Visualizar financeiro', 'Visualizar informações financeiras.'),
    ('finance', 'create', 'Criar lançamentos', 'Criar lançamentos financeiros.'),
    ('finance', 'edit', 'Editar lançamentos', 'Editar lançamentos financeiros.'),
    ('finance', 'pay', 'Efetuar pagamentos', 'Efetuar pagamentos e recebimentos.'),

    -- ESTOQUE
    ('inventory', 'view', 'Visualizar estoque', 'Visualizar estoque.'),
    ('inventory', 'create', 'Movimentar estoque', 'Criar movimentações de estoque.'),
    ('inventory', 'edit', 'Ajustar estoque', 'Ajustar estoque.'),

    -- COMPRAS
    ('purchases', 'view', 'Visualizar compras', 'Visualizar compras.'),
    ('purchases', 'create', 'Criar compras', 'Criar compras.'),
    ('purchases', 'edit', 'Editar compras', 'Editar compras.'),

    -- RELATÓRIOS
    ('reports', 'view', 'Visualizar relatórios', 'Visualizar relatórios.'),

    -- CONFIGURAÇÕES
    ('settings', 'view', 'Visualizar configurações', 'Visualizar configurações.'),
    ('settings', 'edit', 'Editar configurações', 'Editar configurações.')

ON CONFLICT (module, action) DO NOTHING;


-- ============================================================
-- 8. ASSOCIAR O ROLE_ID DOS MEMBROS EXISTENTES
-- ============================================================

UPDATE public.organization_members om
SET role_id = r.id
FROM public.roles r
WHERE r.slug = CASE
    WHEN om.role = 'owner' THEN 'owner'
    WHEN om.role = 'admin' THEN 'admin'
    WHEN om.role = 'sales' THEN 'sales'
    WHEN om.role = 'finance' THEN 'finance'
    WHEN om.role = 'inventory' THEN 'inventory'
    ELSE 'owner'
END
AND om.role_id IS NULL;


-- ============================================================
-- 9. ROLE_ID OBRIGATÓRIO
--
-- Só fazemos isso depois de preencher os registros existentes.
-- ============================================================

ALTER TABLE public.organization_members
ALTER COLUMN role_id SET NOT NULL;


-- ============================================================
-- 10. FOREIGN KEY
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'organization_members_role_id_fkey'
    ) THEN

        ALTER TABLE public.organization_members
        ADD CONSTRAINT organization_members_role_id_fkey
        FOREIGN KEY (role_id)
        REFERENCES public.roles(id)
        ON DELETE RESTRICT;

    END IF;

END
$$;


-- ============================================================
-- 11. PERMISSÕES POR PAPEL
-- ============================================================

-- OWNER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'owner'
ON CONFLICT DO NOTHING;


-- ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'admin'
AND (
    p.module <> 'users'
    OR p.action IN ('view', 'invite', 'edit', 'remove')
)
ON CONFLICT DO NOTHING;


-- VENDEDOR
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'sales'
AND (
    (p.module = 'customers')
    OR (p.module = 'products' AND p.action = 'view')
    OR (p.module = 'orders')
)
ON CONFLICT DO NOTHING;


-- FINANCEIRO
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'finance'
AND (
    p.module = 'finance'
    OR p.module = 'reports'
    OR (p.module = 'customers' AND p.action = 'view')
    OR (p.module = 'orders' AND p.action = 'view')
)
ON CONFLICT DO NOTHING;


-- ESTOQUISTA
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'inventory'
AND (
    p.module = 'inventory'
    OR p.module = 'products'
    OR (p.module = 'purchases')
)
ON CONFLICT DO NOTHING;