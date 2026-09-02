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
  updatePhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  showPhonePrompt: boolean;
  setShowPhonePrompt: (show: boolean) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const SKIP_KEY = "sgp_phone_prompt_skipped";

function CustomerAuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

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

  // Check if user previously skipped the prompt
  useEffect(() => {
    const skipped = localStorage.getItem(SKIP_KEY);
    const skippedEmail = skipped ? JSON.parse(skipped) : null;
    if (user?.email && skippedEmail === user.email) {
      setPromptDismissed(true);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user && !user.phone && !promptDismissed) {
      setShowPhonePrompt(true);
    }
  }, [user, promptDismissed]);

  const login = () => signIn("google");
  const logout = () => {
    localStorage.removeItem(SKIP_KEY);
    signOut();
  };

  const handleSkip = useCallback(() => {
    setShowPhonePrompt(false);
    setPromptDismissed(true);
    if (user?.email) {
      localStorage.setItem(SKIP_KEY, JSON.stringify(user.email));
    }
  }, [user?.email]);

  const updatePhone = useCallback(
    async (phone: string) => {
      const res = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, userId: user?.userId }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPhonePrompt(false);
        localStorage.removeItem(SKIP_KEY);
        window.location.reload();
        return { success: true };
      }
      return { success: false, error: data.error };
    },
    [user?.userId]
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
