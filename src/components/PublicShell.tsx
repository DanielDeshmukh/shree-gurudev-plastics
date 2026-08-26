"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CompareBar from "@/components/CompareBar";
import FestivalBar from "@/components/FestivalBar";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <FestivalBar />
      <Navbar />
      {children}
      <Footer />
      <CartDrawer />
      <CompareBar />
    </>
  );
}
