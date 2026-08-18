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
      } catch (e) {
        console.error("SignIn DB error (non-blocking):", e);
      }

      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.googleId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.googleId) {
        try {
          const dbUser = await db.customerUser.findUnique({
            where: { googleId: token.googleId as string },
          });
          if (dbUser) {
            (session as any).userId = dbUser.id;
            (session as any).phone = dbUser.phone;
          }
        } catch (e) {
          // DB not available, session works without DB sync
        }
      }
      return session;
    },
  },
};
