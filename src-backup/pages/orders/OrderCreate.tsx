import {
    ArrowLeft,
    Package,
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSettings } from "@/features/settings/SettingsContext";

import {
    useCreateOrderMutation,
    useOrderCreateDataQuery,
} from "@/features/orders/orders.queries";

import type {
    OrderCreateItem,
} from "@/features/orders/orders.types";

export function OrderCreate() {
    const navigate = useNavigate();
    const { formatCurrency, currency } = useSettings();

    const currencySymbol =
        currency === "USD"
            ? "$"
            : currency === "EUR"
                ? "€"
                : "R$";

    const {
        data,
        isLoading,
        isError,
        error,
    } = useOrderCreateDataQuery();

    const createOrderMutation = useCreateOrderMutation();

    const [customerId, setCustomerId] = useState("");
    const [items, setItems] = useState<OrderCreateItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [notes, setNotes] = useState("");

    const mutationError =
        createOrderMutation.error instanceof Error
            ? createOrderMutation.error.message
            : null;

    const [selectedProductId, setSelectedProductId] =
        useState("");
    const [productQuantity, setProductQuantity] = useState(1);

    const subtotal = useMemo(
        () =>
            items.reduce(
                (total, item) => total + item.totalPrice,
                0,
            ),
        [items],
    );

    const total = Math.max(
        subtotal - discount + shipping,
        0,
    );

    function handleAddProduct() {
        if (!data || !selectedProductId) {
            return;
        }

        const product = data.products.find(
            (item) => item.id === selectedProductId,
        );

        if (!product) {
            return;
        }

        const existingItem = items.find(
            (item) => item.productId === product.id,
        );

        const currentQuantity = existingItem?.quantity ?? 0;
        const newQuantity = currentQuantity + productQuantity;

        if (newQuantity > product.stock) {
            return;
        }

        if (existingItem) {
            setItems((currentItems) =>
                currentItems.map((item) =>
                    item.productId === product.id
                        ? {
                            ...item,
                            quantity: newQuantity,
                            totalPrice:
                                newQuantity * item.unitPrice,
                        }
                        : item,
                ),
            );
        } else {
            const newItem: OrderCreateItem = {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                quantity: productQuantity,
                unitPrice: product.price,
                totalPrice:
                    product.price * productQuantity,
            };

            setItems((currentItems) => [
                ...currentItems,
                newItem,
            ]);
        }

        setSelectedProductId("");
        setProductQuantity(1);
    }

    function handleQuantityChange(
        productId: string,
        quantity: number,
    ) {
        const product = data?.products.find(
            (item) => item.id === productId,
        );

        if (!product) {
            return;
        }

        const safeQuantity = Math.max(
            1,
            Math.min(quantity, product.stock),
        );

        setItems((currentItems) =>
            currentItems.map((item) =>
                item.productId === productId
                    ? {
                        ...item,
                        quantity: safeQuantity,
                        totalPrice:
                            safeQuantity * item.unitPrice,
                    }
                    : item,
            ),
        );
    }

    function handleRemoveItem(productId: string) {
        setItems((currentItems) =>
            currentItems.filter(
                (item) => item.productId !== productId,
            ),
        );
    }

    function handleDiscountChange(value: string) {
        const numericValue = Number(value);

        setDiscount(
            Number.isFinite(numericValue)
                ? Math.max(numericValue, 0)
                : 0,
        );
    }

    function handleShippingChange(value: string) {
        const numericValue = Number(value);

        setShipping(
            Number.isFinite(numericValue)
                ? Math.max(numericValue, 0)
                : 0,
        );
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!customerId || items.length === 0) {
            return;
        }

        try {
            const orderId =
                await createOrderMutation.mutateAsync({
                    customerId,
                    items,
                    discount,
                    shipping,
                    paymentMethod: paymentMethod || null,
                    notes,
                });

            navigate(`/orders/${orderId}`);
        } catch {
            // O erro será exibido pela interface abaixo.
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-5 sm:space-y-6">
                <div className="h-8 w-52 animate-pulse rounded-lg bg-slate-200" />

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="h-[520px] animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-[360px] animate-pulse rounded-xl bg-slate-100" />
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 p-6">
                <h2 className="text-base font-semibold text-red-800">
                    Não foi possível carregar os dados
                </h2>

                <p className="mt-2 text-sm text-red-700">
                    {error instanceof Error
                        ? error.message
                        : "Ocorreu um erro ao carregar clientes e produtos."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/orders")}
                    className="mt-5 inline-flex h-10 items-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90"
                >
                    Voltar para pedidos
                </button>
            </div>
        );
    }

    const availableProducts = data.products.filter(
        (product) => {
            const item = items.find(
                (currentItem) =>
                    currentItem.productId === product.id,
            );

            return (
                !item ||
                item.quantity < product.stock
            );
        },
    );

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 sm:space-y-6"
        >
            {/* CABEÇALHO */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate("/orders")}
                        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
                    >
                        <ArrowLeft size={17} />
                        Voltar para pedidos
                    </button>

                    <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
                        Novo pedido
                    </h1>

                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Crie um novo pedido para seu cliente.
                    </p>
                </div>
            </section>

            {/* CONTEÚDO */}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

                {/* COLUNA PRINCIPAL */}
                <div className="space-y-5">

                    {/* CLIENTE */}
                    <section className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <ShoppingCart size={18} />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                    Cliente
                                </h2>

                                <p className="text-xs text-[var(--color-text-muted)]">
                                    Selecione quem está realizando o pedido.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <label
                                htmlFor="customer"
                                className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
                            >
                                Cliente
                            </label>

                            <select
                                id="customer"
                                value={customerId}
                                onChange={(event) =>
                                    setCustomerId(event.target.value)
                                }
                                className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                required
                            >
                                <option value="">
                                    Selecione um cliente
                                </option>

                                {data.customers.map((customer) => (
                                    <option
                                        key={customer.id}
                                        value={customer.id}
                                    >
                                        {customer.name}
                                        {customer.phone
                                            ? ` — ${customer.phone}`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {/* PRODUTOS */}
                    <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
                        <div className="border-b border-[var(--color-border-light)] p-4 sm:p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                    <Package size={18} />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                        Produtos
                                    </h2>

                                    <p className="text-xs text-[var(--color-text-muted)]">
                                        Adicione os produtos que fazem parte do pedido.
                                    </p>
                                </div>
                            </div>

                            {/* ADICIONAR PRODUTO */}
                            <div className="mt-5 space-y-3">
                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                                    <div>
                                        <label
                                            htmlFor="product"
                                            className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
                                        >
                                            Produto
                                        </label>

                                        <select
                                            id="product"
                                            value={selectedProductId}
                                            onChange={(event) => {
                                                setSelectedProductId(
                                                    event.target.value,
                                                );
                                                setProductQuantity(1);
                                            }}
                                            className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="">
                                                Selecione um produto
                                            </option>

                                            {availableProducts.map(
                                                (product) => {
                                                    const existingItem =
                                                        items.find(
                                                            (item) =>
                                                                item.productId ===
                                                                product.id,
                                                        );

                                                    const availableStock =
                                                        product.stock -
                                                        (existingItem?.quantity ??
                                                            0);

                                                    return (
                                                        <option
                                                            key={product.id}
                                                            value={product.id}
                                                        >
                                                            {product.name} —{" "}
                                                            {formatCurrency(
                                                                product.price,
                                                            )}{" "}
                                                            — estoque:{" "}
                                                            {availableStock}
                                                        </option>
                                                    );
                                                },
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="product-quantity"
                                            className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
                                        >
                                            Quantidade
                                        </label>

                                        <div className="flex h-11 overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setProductQuantity(
                                                        (current) =>
                                                            Math.max(
                                                                1,
                                                                current - 1,
                                                            ),
                                                    )
                                                }
                                                disabled={
                                                    productQuantity <= 1
                                                }
                                                className="flex w-10 shrink-0 items-center justify-center border-r border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Diminuir quantidade"
                                            >
                                                <Minus size={16} />
                                            </button>

                                            <input
                                                id="product-quantity"
                                                type="number"
                                                min={1}
                                                max={
                                                    selectedProductId
                                                        ? Math.max(
                                                            1,
                                                            (data.products.find(
                                                                (product) =>
                                                                    product.id ===
                                                                    selectedProductId,
                                                            )?.stock ?? 1) -
                                                                (items.find(
                                                                    (item) =>
                                                                        item.productId ===
                                                                        selectedProductId,
                                                                )?.quantity ??
                                                                    0),
                                                        )
                                                        : 1
                                                }
                                                value={productQuantity}
                                                onChange={(event) => {
                                                    const value = Number(
                                                        event.target.value,
                                                    );

                                                    if (!Number.isFinite(value)) {
                                                        return;
                                                    }

                                                    const product =
                                                        data.products.find(
                                                            (item) =>
                                                                item.id ===
                                                                selectedProductId,
                                                        );

                                                    if (!product) {
                                                        return;
                                                    }

                                                    const existingItem =
                                                        items.find(
                                                            (item) =>
                                                                item.productId ===
                                                                product.id,
                                                        );

                                                    const availableStock =
                                                        product.stock -
                                                        (existingItem?.quantity ??
                                                            0);

                                                    setProductQuantity(
                                                        Math.min(
                                                            Math.max(
                                                                1,
                                                                value,
                                                            ),
                                                            Math.max(
                                                                1,
                                                                availableStock,
                                                            ),
                                                        ),
                                                    );
                                                }}
                                                className="min-w-0 flex-1 border-0 bg-transparent px-2 text-center text-sm font-semibold text-[var(--color-text-primary)] outline-none"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const product =
                                                        data.products.find(
                                                            (item) =>
                                                                item.id ===
                                                                selectedProductId,
                                                        );

                                                    if (!product) {
                                                        return;
                                                    }

                                                    const existingItem =
                                                        items.find(
                                                            (item) =>
                                                                item.productId ===
                                                                product.id,
                                                        );

                                                    const availableStock =
                                                        product.stock -
                                                        (existingItem?.quantity ??
                                                            0);

                                                    setProductQuantity(
                                                        (current) =>
                                                            Math.min(
                                                                current + 1,
                                                                Math.max(
                                                                    1,
                                                                    availableStock,
                                                                ),
                                                            ),
                                                    );
                                                }}
                                                disabled={!selectedProductId}
                                                className="flex w-10 shrink-0 items-center justify-center border-l border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Aumentar quantidade"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={handleAddProduct}
                                            disabled={!selectedProductId}
                                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                                        >
                                            <Plus size={17} />
                                            Adicionar
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs leading-5 text-[var(--color-text-muted)]">
                                    Selecione o produto, informe a quantidade e
                                    adicione ao pedido.
                                </p>
                            </div>
                        </div>

                        {/* LISTA DESKTOP */}
                        {items.length > 0 ? (
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border-light)] bg-slate-50">
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                Produto
                                            </th>

                                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                Estoque
                                            </th>

                                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                Quantidade
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                Unitário
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                Total
                                            </th>

                                            <th className="w-12 px-3 py-3" />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {items.map((item) => {
                                            const product = data.products.find(
                                                (currentProduct) =>
                                                    currentProduct.id ===
                                                    item.productId,
                                            );

                                            return (
                                                <tr
                                                    key={item.productId}
                                                    className="border-b border-[var(--color-border-light)] last:border-b-0"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                                            {item.productName}
                                                        </p>

                                                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                                            SKU: {item.sku}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-center text-sm text-[var(--color-text-secondary)]">
                                                        {product?.stock ?? 0}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="mx-auto flex h-9 w-28 overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        item.productId,
                                                                        item.quantity - 1,
                                                                    )
                                                                }
                                                                disabled={
                                                                    item.quantity <=
                                                                    1
                                                                }
                                                                className="flex w-9 items-center justify-center border-r border-[var(--color-border)] text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                                aria-label={`Diminuir quantidade de ${item.productName}`}
                                                            >
                                                                <Minus size={15} />
                                                            </button>

                                                            <input
                                                                type="number"
                                                                min={1}
                                                                max={product?.stock ?? 1}
                                                                value={item.quantity}
                                                                onChange={(event) =>
                                                                    handleQuantityChange(
                                                                        item.productId,
                                                                        Number(
                                                                            event.target.value,
                                                                        ),
                                                                    )
                                                                }
                                                                className="min-w-0 flex-1 border-0 bg-transparent px-1 text-center text-sm font-medium outline-none focus:ring-0"
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        item.productId,
                                                                        item.quantity + 1,
                                                                    )
                                                                }
                                                                disabled={
                                                                    item.quantity >=
                                                                    (product?.stock ??
                                                                        1)
                                                                }
                                                                className="flex w-9 items-center justify-center border-l border-[var(--color-border)] text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                                aria-label={`Aumentar quantidade de ${item.productName}`}
                                                            >
                                                                <Plus size={15} />
                                                            </button>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-right text-sm text-[var(--color-text-secondary)]">
                                                        {formatCurrency(
                                                            item.unitPrice,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                                                        {formatCurrency(
                                                            item.totalPrice,
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveItem(
                                                                    item.productId,
                                                                )
                                                            }
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                            aria-label={`Remover ${item.productName}`}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-4 py-12 text-center sm:px-5">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <Package size={22} />
                                </div>

                                <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">
                                    Nenhum produto adicionado
                                </p>

                                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                                    Selecione um produto acima para começar.
                                </p>
                            </div>
                        )}

                        {/* LISTA MOBILE */}
                        {items.length > 0 && (
                            <div className="divide-y divide-[var(--color-border-light)] md:hidden">
                                {items.map((item) => {
                                    const product = data.products.find(
                                        (currentProduct) =>
                                            currentProduct.id ===
                                            item.productId,
                                    );

                                    return (
                                        <div
                                            key={item.productId}
                                            className="p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                                        {item.productName}
                                                    </p>

                                                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                                        SKU: {item.sku}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveItem(
                                                            item.productId,
                                                        )
                                                    }
                                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                    aria-label={`Remover ${item.productName}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="mt-4 grid grid-cols-3 gap-3">
                                                <div>
                                                    <p className="text-xs text-[var(--color-text-muted)]">
                                                        Estoque
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">
                                                        {product?.stock ?? 0}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor={`quantity-${item.productId}`}
                                                        className="text-xs text-[var(--color-text-muted)]"
                                                    >
                                                        Quantidade
                                                    </label>

                                                    <div className="mt-1 flex h-9 overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.productId,
                                                                    item.quantity - 1,
                                                                )
                                                            }
                                                            disabled={
                                                                item.quantity <=
                                                                1
                                                            }
                                                            className="flex w-9 shrink-0 items-center justify-center border-r border-[var(--color-border)] text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                            aria-label={`Diminuir quantidade de ${item.productName}`}
                                                        >
                                                            <Minus size={14} />
                                                        </button>

                                                        <input
                                                            id={`quantity-${item.productId}`}
                                                            type="number"
                                                            min={1}
                                                            max={product?.stock ?? 1}
                                                            value={item.quantity}
                                                            onChange={(event) =>
                                                                handleQuantityChange(
                                                                    item.productId,
                                                                    Number(
                                                                        event.target.value,
                                                                    ),
                                                                )
                                                            }
                                                            className="min-w-0 flex-1 border-0 bg-transparent px-1 text-center text-sm font-medium outline-none focus:ring-0"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.productId,
                                                                    item.quantity + 1,
                                                                )
                                                            }
                                                            disabled={
                                                                item.quantity >=
                                                                (product?.stock ??
                                                                    1)
                                                            }
                                                            className="flex w-9 shrink-0 items-center justify-center border-l border-[var(--color-border)] text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                            aria-label={`Aumentar quantidade de ${item.productName}`}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-[var(--color-text-muted)]">
                                                        Total
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                                                        {formatCurrency(
                                                            item.totalPrice,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                                                {formatCurrency(item.unitPrice)}{" "}
                                                por unidade
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* PAGAMENTO E OBSERVAÇÕES */}
                    <section className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-5">
                        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            Informações do pedido
                        </h2>

                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="paymentMethod"
                                    className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
                                >
                                    Forma de pagamento
                                </label>

                                <select
                                    id="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(event) =>
                                        setPaymentMethod(
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Selecione
                                    </option>
                                    <option value="pix">Pix</option>
                                    <option value="credit_card">
                                        Cartão de crédito
                                    </option>
                                    <option value="debit_card">
                                        Cartão de débito
                                    </option>
                                    <option value="cash">
                                        Dinheiro
                                    </option>
                                    <option value="bank_transfer">
                                        Transferência bancária
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="notes"
                                    className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
                                >
                                    Observações
                                </label>

                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    rows={3}
                                    placeholder="Adicione alguma observação..."
                                    className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* RESUMO */}
                <aside>
                    <section className="sticky top-24 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-5">
                        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                            Resumo do pedido
                        </h2>

                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between gap-4 text-sm">
                                <span className="text-[var(--color-text-secondary)]">
                                    Subtotal
                                </span>

                                <span className="font-medium text-[var(--color-text-primary)]">
                                    {formatCurrency(subtotal)}
                                </span>
                            </div>

                            <div>
                                <label
                                    htmlFor="discount"
                                    className="mb-2 block text-sm text-[var(--color-text-secondary)]"
                                >
                                    Desconto
                                </label>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                        {currencySymbol}
                                    </span>

                                    <input
                                        id="discount"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={discount}
                                        onChange={(event) =>
                                            handleDiscountChange(
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-[var(--color-border)] pl-10 pr-3 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="shipping"
                                    className="mb-2 block text-sm text-[var(--color-text-secondary)]"
                                >
                                    Frete
                                </label>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                        {currencySymbol}
                                    </span>

                                    <input
                                        id="shipping"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={shipping}
                                        onChange={(event) =>
                                            handleShippingChange(
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-[var(--color-border)] pl-10 pr-3 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            {mutationError && (
                                <div className="mb-3 rounded-lg border border-red-100 bg-red-50 p-3">
                                    <p className="text-sm font-medium text-red-800">
                                        Não foi possível criar o pedido
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-red-700">
                                        {mutationError}
                                    </p>
                                </div>
                            )}

                            <div className="border-t border-[var(--color-border-light)] pt-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-base font-semibold text-[var(--color-text-primary)]">
                                        Total
                                    </span>

                                    <span className="text-xl font-bold text-[var(--color-primary)]">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-[var(--color-border-light)] pt-4">
                                <button
                                    type="submit"
                                    disabled={
                                        !customerId ||
                                        items.length === 0 ||
                                        createOrderMutation.isPending
                                    }
                                    className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {createOrderMutation.isPending
                                        ? "Criando pedido..."
                                        : "Criar pedido"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/orders")}
                                    className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-slate-50 hover:text-[var(--color-text-primary)]"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </form>
    );
}