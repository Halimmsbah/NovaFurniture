import { api } from "../api";
import type { Product } from "./types";

type WishlistResponse = { data?: Product[]; wishlist?: Product[] };

export async function getWishlist(): Promise<Product[]> {
  const { data } = await api.get<WishlistResponse>("/wishlist");
  return data.data ?? data.wishlist ?? [];
}

export async function addToWishlist(productId: string): Promise<void> {
  await api.patch("/wishlist", { product: productId });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await api.delete(`/wishlist/${productId}`);
}
