-- ============================================================
-- 013_user_authorization.sql
-- Nexo Gestão
--
-- Autorização de usuários por organização
-- ============================================================


-- ============================================================
-- 1. FUNÇÃO CENTRAL DE PERMISSÃO
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_permission(
    p_module text,
    p_action text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members om
        JOIN public.role_permissions rp
            ON rp.role_id = om.role_id
        JOIN public.permissions p
            ON p.id = rp.permission_id
        WHERE om.organization_id = public.get_user_organization_id()
          AND om.user_id = auth.uid()
          AND p.module = p_module
          AND p.action = p_action
    );
$$;


-- ============================================================
-- 2. PERMISSÕES DA FUNÇÃO
-- ============================================================

REVOKE ALL
ON FUNCTION public.has_permission(text, text)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.has_permission(text, text)
TO authenticated;


-- ============================================================
-- 3. RLS DAS TABELAS DE AUTORIZAÇÃO
-- ============================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 4. ROLES — SOMENTE LEITURA
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view roles"
ON public.roles;

CREATE POLICY "Authenticated users can view roles"
ON public.roles
FOR SELECT
TO authenticated
USING (true);


-- ============================================================
-- 5. PERMISSIONS — SOMENTE LEITURA
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view permissions"
ON public.permissions;

CREATE POLICY "Authenticated users can view permissions"
ON public.permissions
FOR SELECT
TO authenticated
USING (true);


-- ============================================================
-- 6. ROLE PERMISSIONS — SOMENTE LEITURA
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view role permissions"
ON public.role_permissions;

CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);


-- ============================================================
-- 7. ORGANIZATION MEMBERS — LEITURA
--
-- Usuário só consegue listar membros da própria organização
-- se possuir users.view.
-- O próprio usuário continua podendo visualizar sua membership.
-- ============================================================

DROP POLICY IF EXISTS "Users can view their memberships"
ON public.organization_members;

DROP POLICY IF EXISTS "Users can view organization members"
ON public.organization_members;

CREATE POLICY "Users can view organization members"
ON public.organization_members
FOR SELECT
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
    AND (
        user_id = auth.uid()
        OR public.has_permission('users', 'view')
    )
);


-- ============================================================
-- 8. ORGANIZATION MEMBERS — INSERÇÃO
--
-- Apenas quem possui users.invite.
--
-- Não permitimos criar diretamente um Owner.
-- O fluxo específico de transferência de propriedade será
-- tratado separadamente.
-- ============================================================

DROP POLICY IF EXISTS "Users can invite organization members"
ON public.organization_members;

CREATE POLICY "Users can invite organization members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.has_permission('users', 'invite')
    AND EXISTS (
        SELECT 1
        FROM public.roles r
        WHERE r.id = role_id
          AND r.slug <> 'owner'
    )
);


-- ============================================================
-- 9. ORGANIZATION MEMBERS — ATUALIZAÇÃO
--
-- Apenas users.edit.
--
-- Owner não pode ser alterado por Admin.
-- Owner também não pode ser criado através desta operação.
-- ============================================================

DROP POLICY IF EXISTS "Users can edit organization members"
ON public.organization_members;

CREATE POLICY "Users can edit organization members"
ON public.organization_members
FOR UPDATE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
    AND (
        user_id = auth.uid()
        OR public.has_permission('users', 'edit')
    )
    AND (
        role <> 'owner'
        OR (
            EXISTS (
                SELECT 1
                FROM public.organization_members current_member
                JOIN public.roles member_role
                    ON member_role.id = current_member.role_id
                WHERE current_member.organization_id =
                    public.get_user_organization_id()
                  AND current_member.user_id = auth.uid()
                  AND member_role.slug = 'owner'
            )
        )
    )
)
WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND (
        user_id = auth.uid()
        OR public.has_permission('users', 'edit')
    )
    AND EXISTS (
        SELECT 1
        FROM public.roles r
        WHERE r.id = role_id
          AND (
              r.slug <> 'owner'
              OR EXISTS (
                  SELECT 1
                  FROM public.organization_members current_member
                  JOIN public.roles member_role
                      ON member_role.id = current_member.role_id
                  WHERE current_member.organization_id =
                      public.get_user_organization_id()
                    AND current_member.user_id = auth.uid()
                    AND member_role.slug = 'owner'
              )
          )
    )
);


-- ============================================================
-- 10. ORGANIZATION MEMBERS — EXCLUSÃO
--
-- Apenas users.remove.
--
-- Ninguém pode remover o Owner.
-- Usuário não pode remover a si mesmo.
-- ============================================================

DROP POLICY IF EXISTS "Users can remove organization members"
ON public.organization_members;

CREATE POLICY "Users can remove organization members"
ON public.organization_members
FOR DELETE
TO authenticated
USING (
    organization_id = public.get_user_organization_id()
    AND public.has_permission('users', 'remove')
    AND user_id <> auth.uid()
    AND role <> 'owner'
);


-- ============================================================
-- 11. GRANTS
-- ============================================================

GRANT SELECT
ON public.roles
TO authenticated;

GRANT SELECT
ON public.permissions
TO authenticated;

GRANT SELECT
ON public.role_permissions
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.organization_members
TO authenticated;