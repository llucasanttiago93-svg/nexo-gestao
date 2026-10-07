import type { UserRole } from "../users.types";

interface UserRoleSelectProps {
  roles: UserRole[];
  value: string;
  disabled?: boolean;
  onChange: (roleId: string) => void;
}

export function UserRoleSelect({
  roles,
  value,
  disabled = false,
  onChange,
}: UserRoleSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
    >
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
}