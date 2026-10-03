import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError, errorMessage } from "./index";
import type { AuthUser } from "./types";
import { AuthContext } from "./auth-context";
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setUser(await api.auth.me());
      setError(null);
    } catch (e) {
      setUser(null);
      setError(
        e instanceof ApiError && e.status === 401 ? null : errorMessage(e),
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const clear = () => setUser(null);
    window.addEventListener("gympark-session-expired", clear);
    return () => window.removeEventListener("gympark-session-expired", clear);
  }, [refresh]);
  const login = async (email: string, password: string) => {
    const u = await api.auth.login(email, password);
    setUser(u);
    setError(null);
    return u;
  };
  const changePassword = async (
    current: string,
    next: string,
    confirm: string,
  ) => {
    const u = await api.auth.changePassword(current, next, confirm);
    setUser(u);
    return u;
  };
  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) throw e;
    }
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, error, refresh, login, changePassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
