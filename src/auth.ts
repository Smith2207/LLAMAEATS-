import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { authConfig } from "./auth.config";
import { sendMagicLinkEmail } from "@/lib/email/send";
import { smtpConfig, EMAIL_FROM } from "@/lib/email/mailer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google,
    Nodemailer({
      server: smtpConfig,
      from: EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        await sendMagicLinkEmail({ to: identifier, url });
      },
    }),
  ],
});
