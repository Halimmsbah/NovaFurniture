import { api } from "../api";
import type { Order } from "./types";

type OrderResponse = { data?: Order[]; orders?: Order[]; order?: Order };

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get<OrderResponse>("/orders");
  return data.data ?? data.orders ?? [];
}

export async function createCashOrder(cartId: string, payload: {
  shippingAddress: { street: string; city: string; phone: string };
}): Promise<Order | undefined> {
  const { data } = await api.post<OrderResponse>(`/orders/${cartId}`, payload);
  return data.order ?? data.data?.[0];
}

export async function createCheckoutSession(cartId: string): Promise<{ url?: string; session?: { url: string } }> {
  const { data } = await api.post<{ session?: { url: string }; url?: string }>(
    `/orders/checkOut/${cartId}`,
    {},
    { params: { url: typeof window !== "undefined" ? window.location.origin : "" } },
  );
  return data;
}

export async function listAllOrders(): Promise<Order[]> {
  const { data } = await api.get<OrderResponse>("/orders/all");
  return data.data ?? data.orders ?? [];
}

export async function updateOrderDeliveryStatus(orderId: string, isDelivered: boolean): Promise<Order | undefined> {
  const { data } = await api.patch<{ order?: Order }>(`/orders/admin/${orderId}/delivery`, { isDelivered });
  return data.order;
}

export async function updateOrderStatus(orderId: string, status: NonNullable<Order["status"]>): Promise<Order | undefined> {
  const { data } = await api.patch<{ order?: Order }>(`/orders/admin/${orderId}/status`, { status });
  return data.order;
}

export async function updateOrderNotes(orderId: string, notes: string): Promise<Order | undefined> {
  const { data } = await api.patch<{ order?: Order }>(`/orders/admin/${orderId}/notes`, { notes });
  return data.order;
}
