-- ============================================================
-- 014 - Acesso organizacional aos perfis
-- ============================================================

-- ------------------------------------------------------------
-- 1. Criar perfil automaticamente quando um usuário é criado
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS on_auth_user_created_profile
ON auth.users;


CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();


-- ------------------------------------------------------------
-- 2. Garantir perfil para usuários que já existem
-- ------------------------------------------------------------

INSERT INTO public.profiles (
    id,
    full_name
)
SELECT
    u.id,
    u.raw_user_meta_data ->> 'full_name'
FROM auth.users u
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 3. Remover política antiga de SELECT
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view their own profile"
ON public.profiles;


-- ------------------------------------------------------------
-- 4. Usuário pode ver:
--    - seu próprio perfil
--    - perfis de membros da sua organização,
--      caso possua users.view
-- ------------------------------------------------------------

CREATE POLICY "Users can view organization profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    auth.uid() = id

    OR (
        public.has_permission('users', 'view')

        AND EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id =
                public.get_user_organization_id()
              AND om.user_id = profiles.id
        )
    )
);


-- ------------------------------------------------------------
-- 5. Garantir acesso ao schema
-- ------------------------------------------------------------

GRANT USAGE
ON SCHEMA public
TO authenticated;

GRANT SELECT
ON public.profiles
TO authenticated;