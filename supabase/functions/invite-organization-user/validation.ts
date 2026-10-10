
export interface InviteOrganizationUserInput {
  name: string;
  email: string;
  roleId: string;
}

export interface ValidationResult {
  success: boolean;
  data?: InviteOrganizationUserInput;
  error?: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInviteInput(
  input: unknown,
): ValidationResult {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input)
  ) {
    return {
      success: false,
      error: "Os dados do convite são inválidos.",
    };
  }

  const body = input as Record<string, unknown>;

  if (
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.roleId !== "string"
  ) {
    return {
      success: false,
      error: "Informe nome, e-mail e papel do usuário.",
    };
  }

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const roleId = body.roleId.trim();

  if (name.length < 2 || name.length > 100) {
    return {
      success: false,
      error: "O nome deve ter entre 2 e 100 caracteres.",
    };
  }

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return {
      success: false,
      error: "Informe um e-mail válido.",
    };
  }

  if (!UUID_PATTERN.test(roleId)) {
    return {
      success: false,
      error: "O papel selecionado é inválido.",
    };
  }

  return {
    success: true,
    data: {
      name,
      email,
      roleId,
    },
  };
}
