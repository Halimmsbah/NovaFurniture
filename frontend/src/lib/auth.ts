import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setToken as setApiToken, getToken } from "./api";
import type { AuthUser } from "./api/types";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user?: AuthUser | null) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => {
        setApiToken(token);
        set({ token, user: user ?? null });
      },
      logout: () => {
        setApiToken(null);
        set({ token: null, user: null });
      },
      hydrate: () => {
        const t = getToken();
        if (t) set({ token: t });
      },
    }),
    { name: "nova-auth", partialize: (s) => ({ token: s.token, user: s.user }) },
  ),
);
