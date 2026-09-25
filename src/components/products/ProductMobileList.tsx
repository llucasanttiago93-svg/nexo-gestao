import { Package } from "lucide-react";

import { StockBadge } from "@/components/products/StockBadge";

import type { Product } from "@/features/products/products.types";

interface ProductMobileListProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

export function ProductMobileList({
  products,
  onProductClick,
}: ProductMobileListProps) {
  return (
    <div className="divide-y divide-[var(--color-border-light)] md:hidden">
      {products.map((product) => (
        <article
          key={product.id}
          onClick={() => onProductClick(product.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              onProductClick(product.id);
            }
          }}
          className="cursor-pointer p-4 transition-colors hover:bg-slate-50 active:bg-slate-100"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Package size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-sm font-semibold text-[var(--color-text-primary)]">
                    {product.name}
                  </h2>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {product.sku}
                  </p>
                </div>

                <StatusBadge status={product.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <ProductInfo
                  label="Categoria"
                  value={product.category}
                />

                <ProductInfo
                  label="Preço"
                  value={formatCurrency(product.price)}
                />

                <ProductInfo
                  label="Estoque"
                  value={`${product.stock} unidades`}
                />

                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Situação
                  </p>

                  <div className="mt-1">
                    <StockBadge
                      stock={product.stock}
                      minStock={product.minStock}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}

      {products.length === 0 && <EmptyProducts />}
    </div>
  );
}

interface ProductInfoProps {
  label: string;
  value: string;
}

function ProductInfo({ label, value }: ProductInfoProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
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