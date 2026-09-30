interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: React.ReactNode;
  positive?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  description,
  icon,
  positive = true,
}: MetricCardProps) {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        <span
          className={
            positive
              ? "font-semibold text-green-600"
              : "font-semibold text-red-600"
          }
        >
          {change}
        </span>

        <span className="text-[var(--color-text-muted)]">
          {description}
        </span>
      </div>
    </article>
  );
}