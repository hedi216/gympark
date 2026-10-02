import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface AuthState {
  isLoggedIn: boolean;
  memberName: string;
  login: (name?: string) => void;
  logout: () => void;
}

const STORAGE_KEY = "gym_park_demo_session";
const DEFAULT_NAME = "Amine";

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [memberName, setMemberName] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );

  useEffect(() => {
    if (memberName) {
      localStorage.setItem(STORAGE_KEY, memberName);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [memberName]);

  const value: AuthState = {
    isLoggedIn: memberName !== null,
    memberName: memberName ?? DEFAULT_NAME,
    login: (name = DEFAULT_NAME) => setMemberName(name),
    logout: () => setMemberName(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
