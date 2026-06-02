import axios, { AxiosError } from "axios";

const TOKEN_KEY = "nova-token";
const DEFAULT_API_BASE_URL = "http://localhost:3000/api/v1";

function normalizeBaseURL(url: string) {
  return url.trim().replace(/\/+$/, "");
}

export const apiBaseURL = normalizeBaseURL(
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_API_BASE_URL,
);

export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    // Backend reads JWT from a custom header named `token` (not Authorization).
    if (token) (config.headers as Record<string, string>).token = token;
  }
  return config;
});

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function apiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string; err?: string; error?: string } | undefined;
    return data?.message || data?.error || data?.err || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
