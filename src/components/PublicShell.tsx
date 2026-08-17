"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartButton from "@/components/CartButton";
import CompareBar from "@/components/CompareBar";
import { useCompare } from "@/context/CompareContext";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { compareCount } = useCompare();

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton bottomOffset={compareCount > 0 ? 24 : undefined} />
      <CartButton />
      <CompareBar />
    </>
  );
}
