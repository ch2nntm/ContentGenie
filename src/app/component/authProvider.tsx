"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

interface AuthContextType {
  user: object | null;
  setUser: (user: object) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<object | null>(null);

  useEffect(() => {

    async function fetchUser() {
      try {
        const token = Cookies.get("token");
        if (!token) return;

        const response = await fetch("/api/manage_account/login", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Unauthorized");

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Lỗi lấy user:", error);
        setUser(null);
      }
    }

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
