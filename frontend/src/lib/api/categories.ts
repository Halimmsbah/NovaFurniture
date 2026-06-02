import { api } from "../api";
import type { Category } from "./types";

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<{ data?: Category[]; categories?: Category[] }>("/categories");
  // Backend may return { message, categories } or { message, category }
  // Normalize to an array and fall back to empty array to avoid runtime map errors.
  return (data as any).data ?? (data as any).categories ?? (data as any).category ?? (data as unknown as Category[]) ?? [];
}

export async function getCategory(id: string): Promise<Category> {
  const { data } = await api.get<{ data?: Category; category?: Category }>(`/categories/${id}`);
  return (data.data ?? data.category ?? (data as unknown as Category));
}

export async function createCategory(form: FormData) {
  const { data } = await api.post("/categories", form, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function updateCategory(id: string, form: FormData) {
  const { data } = await api.put(`/categories/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
}
