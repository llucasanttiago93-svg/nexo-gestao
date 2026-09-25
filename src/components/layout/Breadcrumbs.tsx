import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  currentPage: string;
}

export function Breadcrumbs({
  currentPage,
}: BreadcrumbsProps) {
  return (
    <div className="mb-6 flex items-center gap-2 text-sm">
      <span className="text-[var(--color-text-muted)]">
        Nexo
      </span>

      <ChevronRight
        size={14}
        className="text-[var(--color-text-muted)]"
      />

      <span className="font-medium text-[var(--color-text-primary)]">
        {currentPage}
      </span>
    </div>
  );
}