import { createContext, useContext, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout, User } from "@/services/auth";

type AuthCtx = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  hasRole: (r: string) => boolean;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

const USER_KEY = "current_user";

function readUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? (JSON.parse(raw) as User) : null; } catch { return null; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readUser());

  const signIn = async (email: string, password: string) => {
    const { user } = await apiLogin(email, password);
    setUser(user);
    return user;
  };

  const signOut = async () => {
    try { await apiLogout(); } finally {
      setUser(null);
    }
  };

  const hasRole = (r: string) => !!user?.roles?.includes(r);

  const value = useMemo(() => ({ user, signIn, signOut, hasRole }), [user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
