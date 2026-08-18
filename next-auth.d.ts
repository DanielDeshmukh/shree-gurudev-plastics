import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    userId?: number;
    phone?: string | null;
    user?: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleId?: string;
    userId?: number;
    phone?: string | null;
  }
}
