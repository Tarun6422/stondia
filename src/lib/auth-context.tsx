import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api, ApiError } from "@/lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "DEALER" | "ARCHITECT" | "CUSTOMER";
  phone?: string;
  avatar?: string;
  address?: string;
  company?: string;
  designation?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<User>("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string, rememberMe = false): Promise<User> => {
      const data = await api.post<{ user: User; accessToken: string }>("/api/auth/login", {
        email,
        password,
        rememberMe,
      });
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const register = useCallback(
    async (name: string, email: string, password: string, phone?: string): Promise<User> => {
      const data = await api.post<{ user: User; accessToken: string }>("/api/auth/register", {
        name,
        email,
        password,
        phone: phone || undefined,
      });
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
