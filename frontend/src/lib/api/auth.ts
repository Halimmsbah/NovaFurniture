import { api } from "../api";
import type { AuthResponse } from "./types";

export async function signin(payload: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>("/auth/signin", payload);
  return data;
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
  rePassword?: string;
  phone?: string;
}) {
  const { data } = await api.post<AuthResponse>("/auth/signup", payload);
  return data;
}

export async function verifyEmail(payload: { email: string; otp: string }) {
  const { data } = await api.post<AuthResponse>("/auth/verify-email", payload);
  return data;
}

export async function resendVerificationCode(payload: { email: string }) {
  const { data } = await api.post<{ message: string }>("/auth/resend-verification", payload);
  return data;
}

export async function changePassword(payload: { password: string; newPassword: string }) {
  const { data } = await api.patch<AuthResponse>("/auth/changePassword", payload);
  return data;
}
