import { createTransport } from "nodemailer";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

export const smtpConfig = {
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false, // STARTTLS en el puerto 587
  auth: SMTP_USER && SMTP_PASSWORD ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
};

// Sin credenciales SMTP, no hay transporte real: send.ts hace log en consola
// en su lugar (modo desarrollo sin cuenta de correo configurada).
export const transporter = SMTP_USER && SMTP_PASSWORD ? createTransport(smtpConfig) : null;

export const EMAIL_FROM = process.env.EMAIL_FROM ?? `LlamaEats <${SMTP_USER ?? "no-reply@llamaeats.pe"}>`;

export async function sendMail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  if (!transporter) {
    console.info(`[dev] Email "${subject}" para ${to} no enviado: falta configurar SMTP_USER/SMTP_PASSWORD.`);
    return;
  }

  const html = await render(react);
  const text = await render(react, { plainText: true });

  await transporter.sendMail({ from: EMAIL_FROM, to, subject, html, text });
}
