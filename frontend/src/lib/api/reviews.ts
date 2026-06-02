import { api } from "../api";
import type { Review } from "./types";

type R = { data?: Review[]; reviews?: Review[] };

export async function listReviews(productId?: string): Promise<Review[]> {
  const { data } = await api.get<R>("/reviews", { params: productId ? { product: productId } : undefined });
  return data.data ?? data.reviews ?? [];
}

export async function addReview(payload: { product: string; text: string; rate: number }) {
  const { data } = await api.post("/reviews", payload);
  return data;
}

export async function deleteReview(id: string) {
  const { data } = await api.delete(`/reviews/${id}`);
  return data;
}
