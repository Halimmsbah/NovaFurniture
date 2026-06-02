import { api } from "../api";
import type { Subcategory } from "./types";

export async function listSubcategories(categoryId?: string): Promise<Subcategory[]> {
  const { data } = await api.get<{ data?: Subcategory[] }>("/subCategories", {
    params: categoryId ? { category: categoryId } : undefined,
  });
  // Backend may return { message, subcategories, page } or { message, subcategory }
  return (data as any).data ?? (data as any).subcategories ?? (data as any).subcategory ?? (data as unknown as Subcategory[]) ?? [];
}

export async function createSubcategory(payload: { name: string; category: string }) {
  const { data } = await api.post("/subCategories", payload);
  return data;
}

export async function updateSubcategory(id: string, payload: { name?: string; category?: string }) {
  const { data } = await api.put(`/subCategories/${id}`, payload);
  return data;
}

export async function deleteSubcategory(id: string) {
  const { data } = await api.delete(`/subCategories/${id}`);
  return data;
}
