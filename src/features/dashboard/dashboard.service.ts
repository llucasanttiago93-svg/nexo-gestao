import { supabase } from "@/lib/supabase";

import type {
    DashboardData,
    DashboardMetrics,
    DashboardChartItem,
    DashboardOrder,
    DashboardProduct,
} from "@/features/dashboard/dashboard.types";

function getMonthRange(offset: number) {
    const now = new Date();

    const start = new Date(
        now.getFullYear(),
        now.getMonth() + offset,
        1,
    );

    const end = new Date(
        now.getFullYear(),
        now.getMonth() + offset + 1,
        1,
    );

    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

async function getCurrentUserId() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Usuário não autenticado.");
    }

    return user.id;
}

async function getOrderMetrics(
    userId: string,
    offset: number,
) {
    const { start, end } = getMonthRange(offset);

    const { data, error } = await supabase
        .from("orders")
        .select("id, total")
        .eq("user_id", userId)
        .gte("created_at", start)
        .lt("created_at", end);

    if (error) {
        throw new Error(
            `Não foi possível carregar os pedidos: ${error.message}`,
        );
    }

    const orders = data ?? [];

    const revenue = orders.reduce(
        (sum, order) => sum + Number(order.total),
        0,
    );

    const orderCount = orders.length;

    return {
        revenue,
        orders: orderCount,
        averageTicket:
            orderCount > 0 ? revenue / orderCount : 0,
    };
}

async function getCustomerCount(userId: string) {
    const { count, error } = await supabase
        .from("customers")
        .select("id", {
            count: "exact",
            head: true,
        })
        .eq("user_id", userId);

    if (error) {
        throw new Error(
            `Não foi possível carregar os clientes: ${error.message}`,
        );
    }

    return count ?? 0;
}

async function getChartData(
    userId: string,
): Promise<DashboardChartItem[]> {
    const months = Array.from({ length: 6 }, (_, index) => {
        return -5 + index;
    });

    const results = await Promise.all(
        months.map(async (offset) => {
            const { start, end } = getMonthRange(offset);

            const { data, error } = await supabase
                .from("orders")
                .select("total")
                .eq("user_id", userId)
                .gte("created_at", start)
                .lt("created_at", end);

            if (error) {
                throw new Error(
                    `Não foi possível carregar o gráfico: ${error.message}`,
                );
            }

            const orders = data ?? [];

            return {
                month: new Date(start).toLocaleDateString(
                    "pt-BR",
                    { month: "short" },
                ),
                revenue: orders.reduce(
                    (sum, order) => sum + Number(order.total),
                    0,
                ),
                orders: orders.length,
            };
        }),
    );

    return results;
}

async function getRecentOrders(
    userId: string,
): Promise<DashboardOrder[]> {
    const { data, error } = await supabase
        .from("orders")
        .select(`
      id,
      order_number,
      total,
      status,
      created_at,
      customers (
        name
      )
    `)
        .eq("user_id", userId)
        .order("created_at", {
            ascending: false,
        })
        .limit(5);

    if (error) {
        throw new Error(
            `Não foi possível carregar os pedidos recentes: ${error.message}`,
        );
    }

    return (data ?? []).map((order) => {
        const customer = Array.isArray(order.customers)
            ? order.customers[0]
            : order.customers;

        return {
            id: order.id,
            orderNumber: order.order_number,
            customerName: customer?.name ?? "Cliente",
            total: Number(order.total),
            status: order.status,
            createdAt: order.created_at,
        };
    });
}

async function getLowStockProducts(
    userId: string,
): Promise<DashboardProduct[]> {
    const { data, error } = await supabase
        .from("products")
        .select("id, name, stock, min_stock")
        .eq("user_id", userId)
        .order("stock", {
            ascending: true,
        })
        .limit(10);

    if (error) {
        throw new Error(
            `Não foi possível carregar o estoque: ${error.message}`,
        );
    }

    return (data ?? [])
        .filter(
            (product) => product.stock <= product.min_stock,
        )
        .map((product) => ({
            id: product.id,
            name: product.name,
            stock: product.stock,
            minStock: product.min_stock,
        }));
}

export async function getDashboardData(): Promise<DashboardData> {
    const userId = await getCurrentUserId();

    const [
        currentOrders,
        previousOrders,
        customers,
        chart,
        recentOrders,
        lowStockProducts,
    ] = await Promise.all([
        getOrderMetrics(userId, 0),
        getOrderMetrics(userId, -1),
        getCustomerCount(userId),
        getChartData(userId),
        getRecentOrders(userId),
        getLowStockProducts(userId),
    ]);

    const metrics: DashboardMetrics = {
        revenue: currentOrders.revenue,
        orders: currentOrders.orders,
        customers,
        averageTicket: currentOrders.averageTicket,

        previousRevenue: previousOrders.revenue,
        previousOrders: previousOrders.orders,
        previousCustomers: customers,
        previousAverageTicket:
            previousOrders.averageTicket,
    };

    return {
        metrics,
        chart,
        recentOrders,
        lowStockProducts,
    };
}