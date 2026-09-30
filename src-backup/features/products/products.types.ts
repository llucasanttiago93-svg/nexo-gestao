export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  status: "active" | "inactive";
  createdAt: string;
}