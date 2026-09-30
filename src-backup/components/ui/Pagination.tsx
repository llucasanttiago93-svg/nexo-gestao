import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    isFetching?: boolean;
    onPageChange: (page: number) => void;
}

function getVisiblePages(
    page: number,
    totalPages: number,
): Array<number | "..."> {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 3) {
        return [1, 2, 3, 4, "...", totalPages];
    }

    if (page >= totalPages - 2) {
        return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

export function Pagination({
    page,
    totalPages,
    totalItems,
    pageSize,
    isFetching = false,
    onPageChange,
}: PaginationProps) {
    if (totalItems === 0 || totalPages <= 1) {
        return null;
    }

    const pages = getVisiblePages(page, totalPages);

    const firstItem = (page - 1) * pageSize + 1;
    const lastItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex flex-col gap-4 border-t border-[var(--color-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-[var(--color-text-secondary)]">
                Mostrando{" "}
                <span className="font-medium text-[var(--color-text-primary)]">
                    {firstItem}–{lastItem}
                </span>{" "}
                de{" "}
                <span className="font-medium text-[var(--color-text-primary)]">
                    {totalItems}
                </span>{" "}
                produtos
            </p>

            <div className="flex items-center justify-between gap-1 sm:justify-end">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1 || isFetching}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-[var(--color-border)] bg-white px-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-slate-50 hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
                >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="flex items-center gap-1">
                    {pages.map((item, index) =>
                        item === "..." ? (
                            <span
                                key={`ellipsis-${index}`}
                                className="flex h-9 w-8 items-center justify-center text-sm text-[var(--color-text-muted)]"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onPageChange(item)}
                                disabled={isFetching}
                                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition ${page === item
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "text-[var(--color-text-secondary)] hover:bg-slate-100 hover:text-[var(--color-text-primary)]"
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {item}
                            </button>
                        ),
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages || isFetching}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-[var(--color-border)] bg-white px-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-slate-50 hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed sm:px-3"
                >
                    <span className="hidden sm:inline">Próxima</span>
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}