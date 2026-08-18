"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

interface CustomerUser {
  userId: number;
  name: string;
  email: string;
  image?: string;
  phone?: string;
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  updatePhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  showPhonePrompt: boolean;
  setShowPhonePrompt: (show: boolean) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

function CustomerAuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);

  const user: CustomerUser | null = session
    ? {
        userId: (session as any).userId,
        name: session.user?.name || "Customer",
        email: session.user?.email || "",
        image: session.user?.image || undefined,
        phone: (session as any).phone || undefined,
      }
    : null;

  useEffect(() => {
    if (user && !user.phone) {
      setShowPhonePrompt(true);
    }
  }, [user]);

  const login = () => signIn("google");
  const logout = () => signOut();

  const updatePhone = useCallback(
    async (phone: string) => {
      const res = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPhonePrompt(false);
        window.location.reload();
        return { success: true };
      }
      return { success: false, error: data.error };
    },
    []
  );

  return (
    <CustomerAuthContext.Provider
      value={{ user, loading: status === "loading", login, logout, updatePhone, showPhonePrompt, setShowPhonePrompt }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CustomerAuthProviderInner>{children}</CustomerAuthProviderInner>
    </SessionProvider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return context;
}
