import { api } from "../api";
import type { AdminUser } from "./types";

type UserResponse = { data?: AdminUser[]; users?: AdminUser[]; user?: AdminUser };

export async function listUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<UserResponse>("/users");
  return data.data ?? data.users ?? [];
}

export async function updateUser(id: string, payload: Partial<AdminUser>) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}