import { api } from "../api";
import type { Cart } from "./types";

type CartResponse = { numOfCartItems?: number; data?: Cart; cart?: Cart };

function unwrap(r: CartResponse): Cart {
  return (r.data ?? r.cart ?? ({ cartItems: [] } as Cart));
}

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<CartResponse>("/carts");
  return unwrap(data);
}

export async function addToCart(productId: string): Promise<Cart> {
  const { data } = await api.post<CartResponse>("/carts", { product: productId });
  return unwrap(data);
}

export async function updateCartItem(productId: string, quantity: number): Promise<Cart> {
  const { data } = await api.put<CartResponse>(`/carts/${productId}`, { quantity });
  return unwrap(data);
}

export async function removeCartItem(productId: string): Promise<Cart> {
  const { data } = await api.delete<CartResponse>(`/carts/${productId}`);
  return unwrap(data);
}

export async function clearCart(): Promise<void> {
  await api.delete("/carts/clear");
}

export async function applyCoupon(code: string): Promise<Cart> {
  const { data } = await api.post<CartResponse>("/carts/applyCoupon", { code });
  return unwrap(data);
}
