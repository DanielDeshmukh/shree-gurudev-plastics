"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

function CustomerAuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const user: CustomerUser | null = useMemo(
    () =>
      session
        ? {
            userId: (session as any).userId,
            name: session.user?.name || "Customer",
            email: session.user?.email || "",
            image: session.user?.image || undefined,
            phone: (session as any).phone || undefined,
          }
        : null,
    [session]
  );

  const login = () => signIn("google");
  const logout = () => signOut();

  return (
    <CustomerAuthContext.Provider
      value={{ user, loading: status === "loading", login, logout }}
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
