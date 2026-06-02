import { api } from "../api";
import type { Coupon } from "./types";

type CouponResponse = { data?: Coupon[]; coupons?: Coupon[]; coupon?: Coupon };

export async function listCoupons(): Promise<Coupon[]> {
  const { data } = await api.get<CouponResponse>("/coupons");
  return data.data ?? data.coupons ?? [];
}

export async function createCoupon(payload: { code: string; discount: number; expires: string }) {
  const { data } = await api.post("/coupons", payload);
  return data;
}

export async function updateCoupon(id: string, payload: Partial<{ code: string; discount: number; expires: string }>) {
  const { data } = await api.put(`/coupons/${id}`, payload);
  return data;
}

export async function deleteCoupon(id: string) {
  const { data } = await api.delete(`/coupons/${id}`);
  return data;
}