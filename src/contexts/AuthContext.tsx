"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("mk_manager_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function storeUser(user: User | null) {
  if (user) {
    localStorage.setItem("mk_manager_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("mk_manager_user");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setHydrated(true);
  }, []);

  const login = useCallback(
    async (email: string, _password: string): Promise<boolean> => {
      await new Promise((r) => setTimeout(r, 800));

      if (email) {
        const newUser: User = {
          id: "1",
          name: "Admin",
          email,
        };
        setUser(newUser);
        storeUser(newUser);
        return true;
      }
      return false;
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, _password: string): Promise<boolean> => {
      await new Promise((r) => setTimeout(r, 800));

      if (name && email) {
        const newUser: User = { id: String(Date.now()), name, email };
        setUser(newUser);
        storeUser(newUser);
        return true;
      }
      return false;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    storeUser(null);
  }, []);

  if (!hydrated) return null;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
