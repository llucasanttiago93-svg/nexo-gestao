interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantClasses: Record<
  NonNullable<BadgeProps["variant"]>,
  string
> = {
  default:
    "bg-gray-100 text-gray-700",
  success:
    "bg-green-100 text-green-700",
  warning:
    "bg-yellow-100 text-yellow-700",
  danger:
    "bg-red-100 text-red-700",
};

export function Badge({
  children,
  variant = "default",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}