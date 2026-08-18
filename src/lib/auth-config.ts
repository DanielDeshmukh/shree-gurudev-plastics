import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const providers: NextAuthOptions["providers"] = [];

if (googleClientId && googleClientSecret && googleClientId !== "YOUR_GOOGLE_CLIENT_ID") {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user) return true;

      try {
        let existing = await db.customerUser.findUnique({
          where: { googleId: user.id! },
        });

        if (!existing) {
          existing = await db.customerUser.create({
            data: {
              googleId: user.id!,
              name: user.name || "Customer",
              email: user.email!,
              image: user.image,
            },
          });
        }

        (user as any).dbId = existing.id;
        (user as any).dbPhone = existing.phone;
      } catch (e) {
        console.error("SignIn DB error (non-blocking):", e);
      }

      return true;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.googleId = account.providerAccountId;
      }
      if ((user as any)?.dbId) {
        token.userId = (user as any).dbId;
        token.phone = (user as any).dbPhone || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        (session as any).userId = token.userId;
        (session as any).phone = token.phone || null;
      }
      return session;
    },
  },
};
