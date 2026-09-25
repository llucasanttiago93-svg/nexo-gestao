import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <Inbox className="h-6 w-6" />
      </div>

      <h3 className="text-sm font-semibold text-gray-900">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-md text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}