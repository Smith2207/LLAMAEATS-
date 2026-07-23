import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { authConfig } from "./auth.config";
import { sendMagicLinkEmail } from "@/lib/email/send";
import { smtpConfig, EMAIL_FROM } from "@/lib/email/mailer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      // Los usuarios demo (admin/restaurante/cliente) los pre-crea el script
      // de seed por email, antes de que exista una cuenta de Google
      // vinculada. Sin esto, Auth.js rechaza el primer login real con
      // OAuthAccountNotLinked.
      allowDangerousEmailAccountLinking: true,
    }),
    Nodemailer({
      server: smtpConfig,
      from: EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        await sendMagicLinkEmail({ to: identifier, url });
      },
    }),
  ],
});
