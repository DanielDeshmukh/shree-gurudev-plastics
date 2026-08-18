import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user) return false;

      try {
        const existing = await db.customerUser.findUnique({
          where: { googleId: user.id! },
        });

        if (!existing) {
          await db.customerUser.create({
            data: {
              googleId: user.id!,
              name: user.name || "Customer",
              email: user.email!,
              image: user.image,
            },
          });
        }
        return true;
      } catch (e) {
        console.error("SignIn error:", e);
        return false;
      }
    },
    async jwt({ token, account }) {
      if (account) {
        token.googleId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.googleId) {
        const dbUser = await db.customerUser.findUnique({
          where: { googleId: token.googleId as string },
        });
        if (dbUser) {
          (session as any).userId = dbUser.id;
          (session as any).phone = dbUser.phone;
        }
      }
      return session;
    },
  },
};
