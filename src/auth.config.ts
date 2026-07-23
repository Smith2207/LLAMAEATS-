import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";
import { authDb } from "@/db/edge";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

// Config edge-safe: solo usa el driver `neon-http` (vía `authDb`), así que
// puede ejecutarse dentro del middleware (Edge runtime) para hacer el
// chequeo de sesión + rol real contra la base de datos, sin necesitar el
// driver `Pool` (Node-only) que usa el resto de la app.
export const authConfig: NextAuthConfig = {
  adapter: DrizzleAdapter(authDb, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/iniciar-sesion",
  },
  providers: [],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.phone = user.phone;
      }
      return session;
    },
  },
};
