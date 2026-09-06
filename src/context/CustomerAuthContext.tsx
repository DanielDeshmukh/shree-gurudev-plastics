"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

interface CustomerUser {
  userId: number;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  hasSeenGuide: boolean;
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  markGuideSeen: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

function CustomerAuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const hasSeenGuide = (session as any)?.hasSeenGuide ?? false;
  const guideSeenLocal = typeof window !== "undefined" && localStorage.getItem("guideSeen") === "1";
  const guideSeen = hasSeenGuide || guideSeenLocal;

  const user: CustomerUser | null = useMemo(
    () =>
      session
        ? {
            userId: (session as any).userId,
            name: session.user?.name || "Customer",
            email: session.user?.email || "",
            image: session.user?.image || undefined,
            phone: (session as any).phone || undefined,
            hasSeenGuide: (session as any).hasSeenGuide ?? false,
          }
        : null,
    [session]
  );

  useEffect(() => {
    if (status === "authenticated" && !guideSeen && pathname !== "/how-to-order") {
      router.push("/how-to-order");
    }
  }, [status, guideSeen, pathname, router]);

  const markGuideSeen = useCallback(() => {
    fetch("/api/auth/seen-guide", { method: "POST", credentials: "include" })
      .then(() => { window.location.reload(); })
      .catch(() => {});
  }, []);

  const login = () => signIn("google");
  const logout = () => signOut();

  return (
    <CustomerAuthContext.Provider
      value={{ user, loading: status === "loading", login, logout, markGuideSeen }}
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
