import { api } from "../api";
import type { DashboardStats, Order, Product } from "./types";

export async function getStats(): Promise<DashboardStats> {
  const { data } = await api.get<{ stats: DashboardStats }>("/dashboard/stats");
  return data.stats;
}

export async function getRevenue(period: "daily" | "monthly" = "monthly") {
  const { data } = await api.get<{ data: Array<{ _id: { year: number; month: number; day?: number }; totalRevenue: number; orderCount: number }> }>("/dashboard/revenue", { params: { period } });
  return data.data;
}

export async function getTopProducts(limit = 10): Promise<Product[]> {
  const { data } = await api.get<{ products: Product[] }>("/dashboard/top-products", { params: { limit } });
  return data.products;
}

export async function getRecentOrders(limit = 10): Promise<Order[]> {
  const { data } = await api.get<{ orders: Order[] }>("/dashboard/recent-orders", { params: { limit } });
  return data.orders;
}

export async function getLowStock(threshold = 10): Promise<Product[]> {
  const { data } = await api.get<{ products: Product[] }>("/dashboard/low-stock", { params: { threshold } });
  return data.products;
}

export async function getOutOfStock(): Promise<Product[]> {
  const { data } = await api.get<{ products: Product[] }>("/dashboard/out-of-stock");
  return data.products;
}

export async function getSalesByCategory() {
  const { data } = await api.get<{ data: Array<{ _id: string; categoryName: string; totalSales: number; totalQuantity: number }> }>("/dashboard/sales-by-category");
  return data.data;
}