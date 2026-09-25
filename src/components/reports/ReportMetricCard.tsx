import type { LucideIcon } from "lucide-react";

interface ReportMetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "positive" | "negative";
}

export function ReportMetricCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: ReportMetricCardProps) {
  const iconStyles = {
    default: "bg-slate-100 text-slate-600",
    positive: "bg-emerald-50 text-emerald-600",
    negative: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconStyles[variant]}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}