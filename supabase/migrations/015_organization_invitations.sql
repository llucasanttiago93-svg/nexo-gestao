-- ============================================================
-- 015 - Convites de usuários da organização
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id uuid NOT NULL
        REFERENCES public.organizations(id)
        ON DELETE CASCADE,

    email text NOT NULL,

    role_id uuid NOT NULL
        REFERENCES public.roles(id),

    invited_by uuid NOT NULL
        REFERENCES auth.users(id),

    status text NOT NULL DEFAULT 'pending',

    expires_at timestamptz NOT NULL
        DEFAULT (now() + interval '7 days'),

    accepted_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT organization_invitations_status_check
        CHECK (
            status IN (
                'pending',
                'accepted',
                'expired',
                'cancelled'
            )
        )
);


-- ============================================================
-- Índices
-- ============================================================

CREATE INDEX IF NOT EXISTS
    idx_organization_invitations_organization
ON public.organization_invitations (
    organization_id
);

CREATE INDEX IF NOT EXISTS
    idx_organization_invitations_email
ON public.organization_invitations (
    lower(email)
);

CREATE INDEX IF NOT EXISTS
    idx_organization_invitations_status
ON public.organization_invitations (
    status
);


-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.organization_invitations
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SELECT
-- Apenas usuários com users.view podem visualizar convites
-- da própria organização.
-- ============================================================

CREATE POLICY "Users can view organization invitations"
ON public.organization_invitations
FOR SELECT
TO authenticated
USING (
    organization_id =
        public.get_user_organization_id()
    AND public.has_permission('users', 'view')
);


-- ============================================================
-- INSERT
-- Apenas usuários com users.invite podem criar convites.
-- ============================================================

CREATE POLICY "Users can create organization invitations"
ON public.organization_invitations
FOR INSERT
TO authenticated
WITH CHECK (
    organization_id =
        public.get_user_organization_id()
    AND invited_by = auth.uid()
    AND public.has_permission('users', 'invite')
);


-- ============================================================
-- UPDATE
-- Apenas usuários com users.invite podem atualizar convites.
-- ============================================================

CREATE POLICY "Users can update organization invitations"
ON public.organization_invitations
FOR UPDATE
TO authenticated
USING (
    organization_id =
        public.get_user_organization_id()
    AND public.has_permission('users', 'invite')
)
WITH CHECK (
    organization_id =
        public.get_user_organization_id()
);


-- ============================================================
-- DELETE
-- Apenas usuários com users.remove podem excluir convites.
-- ============================================================

CREATE POLICY "Users can delete organization invitations"
ON public.organization_invitations
FOR DELETE
TO authenticated
USING (
    organization_id =
        public.get_user_organization_id()
    AND public.has_permission('users', 'remove')
);


-- ============================================================
-- Grants
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.organization_invitations
TO authenticated;