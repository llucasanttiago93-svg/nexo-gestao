import type { Product } from "@/features/products/products.types";

import { StockBadge } from "@/components/products/StockBadge";

interface ProductTableProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

export function ProductTable({
  products,
  onProductClick,
}: ProductTableProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[760px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-slate-50">
            <TableHeader>Produto</TableHeader>
            <TableHeader>SKU</TableHeader>
            <TableHeader>Categoria</TableHeader>
            <TableHeader>Preço</TableHeader>
            <TableHeader>Estoque</TableHeader>
            <TableHeader>Status</TableHeader>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              onClick={() => onProductClick(product.id)}
              className="cursor-pointer border-b border-[var(--color-border-light)] last:border-0 hover:bg-slate-50"
            >
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {product.name}
                </span>
              </td>

              <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                {product.sku}
              </td>

              <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                {product.category}
              </td>

              <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-primary)]">
                {formatCurrency(product.price)}
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {product.stock}
                  </span>

                  <StockBadge
                    stock={product.stock}
                    minStock={product.minStock}
                  />
                </div>
              </td>

              <td className="px-6 py-4">
                <StatusBadge status={product.status} />
              </td>
            </tr>
          ))}

          {products.length === 0 && (
            <tr>
              <td colSpan={6}>
                <EmptyProducts />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

function TableHeader({ children }: TableHeaderProps) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
      {children}
    </th>
  );
}

interface StatusBadgeProps {
  status: Product["status"];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const active = status === "active";

  return (
    <span
      className={
        active
          ? "inline-flex shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
          : "inline-flex shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
      }
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

function EmptyProducts() {
  return (
    <div className="px-4 py-12 text-center">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Nenhum produto encontrado.
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}