import { api } from "../api";
import type { Brand } from "./types";

export async function listBrands(): Promise<Brand[]> {
  const { data } = await api.get<{ data?: Brand[]; brands?: Brand[] }>("/brands");
  // Backend sometimes returns { message, brand } or { message, brand: [] }
  // Accept both shapes and fall back to an empty array to avoid runtime errors.
  return (data as any).data ?? (data as any).brands ?? (data as any).brand ?? (data as unknown as Brand[]) ?? [];
}

export async function createBrand(form: FormData) {
  const { data } = await api.post("/brands", form, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function updateBrand(id: string, form: FormData) {
  const { data } = await api.put(`/brands/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function deleteBrand(id: string) {
  const { data } = await api.delete(`/brands/${id}`);
  return data;
}
