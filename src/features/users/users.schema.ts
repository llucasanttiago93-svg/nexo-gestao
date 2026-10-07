import { z } from "zod";

export const updateUserRoleSchema = z.object({
  roleId: z.string().uuid("Selecione um perfil válido."),
});

export type UpdateUserRoleFormData = z.infer<
  typeof updateUserRoleSchema
>;