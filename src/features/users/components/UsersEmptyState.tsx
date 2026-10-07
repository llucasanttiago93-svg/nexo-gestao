import { EmptyState } from "@/components/ui/EmptyState";

export function UsersEmptyState() {
  return (
    <EmptyState
      title="Nenhum usuário encontrado"
      description="Ainda não existem outros usuários vinculados a esta organização."
    />
  );
}