import { api } from "../api";
import type { Address } from "./types";

type AddressResponse = { data?: Address[]; addresses?: Address[] };

export async function getAddresses(): Promise<Address[]> {
  const { data } = await api.get<AddressResponse>("/addresses");
  return data.data ?? data.addresses ?? [];
}

export async function addAddress(payload: Address): Promise<Address[]> {
  const { data } = await api.patch<AddressResponse>("/addresses", payload);
  return data.data ?? data.addresses ?? [];
}

export async function removeAddress(id: string): Promise<Address[]> {
  const { data } = await api.delete<AddressResponse>(`/addresses/${id}`);
  return data.data ?? data.addresses ?? [];
}
