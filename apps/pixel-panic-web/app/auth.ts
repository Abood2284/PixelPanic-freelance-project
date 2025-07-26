import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server";
import { users } from "@repo/db/schema"; // Ensure you have access to your schema
import { eq } from "drizzle-orm";

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [Google],
  trustHost: true,
  callbacks: {
    // This callback includes the user's role and ID in the session object
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // @ts-ignore - Augment the session user type to include 'role'
        session.user.role = token.role;
      }
      return session;
    },
    // This callback gets the user's role from the database and adds it to the JWT
    async jwt({ token }) {
      if (!token.sub) return token;

      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, token.sub),
      });

      if (dbUser) {
        // @ts-ignore
        token.role = dbUser.role;
      }
      return token;
    },
  },
  // Optionally, define a custom login page
  pages: {
    signIn: "/authentication",
  },
});
