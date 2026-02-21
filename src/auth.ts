import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { upsertUserByEmail } from "@/lib/store";

export const { handlers, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      await upsertUserByEmail({
        email: user.email,
        name: user.name,
        image: user.image
      });

      return true;
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (!email) {
        return token;
      }

      const dbUser = await upsertUserByEmail({
        email,
        name: user?.name,
        image: user?.image
      });

      token.userId = dbUser.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId;
      }
      return session;
    }
  }
});
