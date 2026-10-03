import { createContext, useContext } from "react";
import type { AuthUser } from "./types";
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  changePassword: (
    current: string,
    next: string,
    confirm: string,
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
}
export const AuthContext = createContext<AuthState | null>(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is required");
  return value;
}
