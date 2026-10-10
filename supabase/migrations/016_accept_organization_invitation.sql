
-- ============================================================
-- 016 - Aceitação segura de convites
-- Nexo Gestão
-- ============================================================

CREATE OR REPLACE FUNCTION public.accept_organization_invitation(
    p_invitation_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_user_email text;
    v_invitation record;
    v_role_slug text;
    v_existing_organization uuid;
BEGIN
    -- Usuário precisa estar autenticado.
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado.';
    END IF;

    -- O e-mail vem das informações autenticadas do Supabase.
    v_user_email := lower(
        trim(COALESCE(auth.jwt() ->> 'email', ''))
    );

    IF v_user_email = '' THEN
        RAISE EXCEPTION 'Não foi possível validar o e-mail da conta.';
    END IF;

    -- Bloqueia a linha durante o processamento.
    SELECT
        i.id,
        i.organization_id,
        i.email,
        i.role_id,
        i.status,
        i.expires_at
    INTO v_invitation
    FROM public.organization_invitations AS i
    WHERE i.id = p_invitation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Convite não encontrado.';
    END IF;

    IF lower(trim(v_invitation.email)) <> v_user_email THEN
        RAISE EXCEPTION 'O e-mail da conta não corresponde ao convite.';
    END IF;

    IF v_invitation.status <> 'pending' THEN
        RAISE EXCEPTION 'Este convite não está mais pendente.';
    END IF;

    IF v_invitation.expires_at <= now() THEN
        UPDATE public.organization_invitations
        SET status = 'expired',
            updated_at = now()
        WHERE id = v_invitation.id;

        RAISE EXCEPTION 'Este convite expirou.';
    END IF;

    SELECT r.slug
    INTO v_role_slug
    FROM public.roles AS r
    WHERE r.id = v_invitation.role_id;

    IF NOT FOUND OR v_role_slug = 'owner' THEN
        RAISE EXCEPTION 'O perfil deste convite não é válido.';
    END IF;

    -- Evita que um usuário seja associado a organizações
    -- diferentes por meio deste fluxo.
    SELECT om.organization_id
    INTO v_existing_organization
    FROM public.organization_members AS om
    WHERE om.user_id = v_user_id
    LIMIT 1;

    IF FOUND THEN
        IF v_existing_organization = v_invitation.organization_id THEN
            RAISE EXCEPTION 'Você já pertence a esta organização.';
        ELSE
            RAISE EXCEPTION 'Esta conta já pertence a outra organização.';
        END IF;
    END IF;

    -- A associação e a aceitação são confirmadas juntas.
    INSERT INTO public.organization_members (
        organization_id,
        user_id,
        role,
        role_id
    )
    VALUES (
        v_invitation.organization_id,
        v_user_id,
        v_role_slug,
        v_invitation.role_id
    );

    UPDATE public.organization_invitations
    SET status = 'accepted',
        accepted_at = now(),
        updated_at = now()
    WHERE id = v_invitation.id;

    RETURN jsonb_build_object(
        'success', true,
        'organization_id', v_invitation.organization_id
    );
END;
$$;

REVOKE ALL
ON FUNCTION public.accept_organization_invitation(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.accept_organization_invitation(uuid)
TO authenticated;
