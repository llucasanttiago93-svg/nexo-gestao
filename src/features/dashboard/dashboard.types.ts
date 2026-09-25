export interface DashboardMetrics {
  revenue: number;
  orders: number;
  customers: number;
  averageTicket: number;
  previousRevenue: number;
  previousOrders: number;
  previousCustomers: number;
  previousAverageTicket: number;
}

export interface DashboardChartItem {
  month: string;
  revenue: number;
  orders: number;
}

export interface DashboardOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface DashboardProduct {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  chart: DashboardChartItem[];
  recentOrders: DashboardOrder[];
  lowStockProducts: DashboardProduct[];
}