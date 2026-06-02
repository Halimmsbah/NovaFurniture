import { api } from "../api";
import type { PaginatedProducts, Product } from "./types";

export type ProductQuery = {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  subcategory?: string;
  priceGte?: number;
  priceLte?: number;
  sort?: string;
  search?: string;
  keyword?: string;
};

function unwrap(res: PaginatedProducts | { product?: Product[]; products?: Product[]; data?: Product[] }): Product[] {
  return (res as PaginatedProducts).product ?? (res as PaginatedProducts).products ?? (res as PaginatedProducts).data ?? [];
}

export async function listProducts(q: ProductQuery = {}): Promise<{ items: Product[]; raw: PaginatedProducts }> {
  const { data } = await api.get<PaginatedProducts>("/products", { params: q });
  return { items: unwrap(data), raw: data };
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<{ product?: Product; data?: Product }>(`/products/${id}`);
  return (data.product ?? data.data ?? (data as unknown as Product));
}

export async function createProduct(form: FormData) {
  const { data } = await api.post("/products", form, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function updateProduct(id: string, form: FormData) {
  const { data } = await api.put(`/products/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function reorderProducts(ids: string[]) {
  const { data } = await api.post(`/products/reorder`, { ids });
  return data;
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}
