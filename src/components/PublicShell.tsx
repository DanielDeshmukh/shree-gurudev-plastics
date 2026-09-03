"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CompareBar from "@/components/CompareBar";
import FestivalBar from "@/components/FestivalBar";
import FestivalGarland from "@/components/FestivalGarland";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <FestivalBar />
      <Navbar />
      {isHome && <FestivalGarland />}
      {children}
      <Footer />
      <CartDrawer />
      <CompareBar />
    </>
  );
}
