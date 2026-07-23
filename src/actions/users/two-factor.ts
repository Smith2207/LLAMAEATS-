"use server";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { roleActionClient } from "@/lib/actions/safe-action";
import { generateBase32Secret, totpAuthUri, verifyTotpCode } from "@/lib/auth/totp";
import { signTwoFactorCookie, TWO_FACTOR_COOKIE_NAME } from "@/lib/auth/two-factor-cookie";
import { totpCodeSchema } from "@/lib/validations/two-factor";
import { z } from "zod";

async function setVerifiedCookie(userId: string) {
  const { value, expiresAt } = await signTwoFactorCookie(userId);
  const store = await cookies();
  store.set(TWO_FACTOR_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Genera un secreto nuevo (aún no activo hasta confirmarlo con un código).
export const enrollTwoFactorAction = roleActionClient("admin")
  .inputSchema(z.object({}))
  .action(async ({ ctx }) => {
    const user = await db.query.users.findFirst({ where: eq(users.id, ctx.user.id) });
    if (user?.twoFactorEnabled) {
      throw new Error("Ya tienes verificación en dos pasos activada. Desactívala antes de reconfigurar.");
    }

    const secret = generateBase32Secret();
    await db.update(users).set({ twoFactorSecret: secret }).where(eq(users.id, ctx.user.id));

    return { secret, otpauthUri: totpAuthUri(secret, ctx.user.email ?? ctx.user.id) };
  });

// Confirma el código generado con el secreto recién creado y activa 2FA.
export const confirmTwoFactorAction = roleActionClient("admin")
  .inputSchema(totpCodeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = await db.query.users.findFirst({ where: eq(users.id, ctx.user.id) });
    if (!user?.twoFactorSecret) throw new Error("Primero genera un código QR para escanear.");

    const valid = await verifyTotpCode(user.twoFactorSecret, parsedInput.code);
    if (!valid) throw new Error("Código incorrecto.");

    await db.update(users).set({ twoFactorEnabled: true }).where(eq(users.id, ctx.user.id));
    await setVerifiedCookie(ctx.user.id);

    revalidatePath("/admin/seguridad");
    return { ok: true };
  });

// Requiere el código vigente para apagar 2FA — evita que una sesión robada
// lo desactive sin conocer el secreto.
export const disableTwoFactorAction = roleActionClient("admin")
  .inputSchema(totpCodeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = await db.query.users.findFirst({ where: eq(users.id, ctx.user.id) });
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      throw new Error("No tienes verificación en dos pasos activada.");
    }

    const valid = await verifyTotpCode(user.twoFactorSecret, parsedInput.code);
    if (!valid) throw new Error("Código incorrecto.");

    await db
      .update(users)
      .set({ twoFactorEnabled: false, twoFactorSecret: null })
      .where(eq(users.id, ctx.user.id));

    const store = await cookies();
    store.delete(TWO_FACTOR_COOKIE_NAME);

    revalidatePath("/admin/seguridad");
    return { ok: true };
  });

// Gate de /verificar-2fa: confirma el código de una sesión ya logueada y
// marca esta sesión como verificada por 12h.
export const verifyTwoFactorLoginAction = roleActionClient("admin")
  .inputSchema(totpCodeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = await db.query.users.findFirst({ where: eq(users.id, ctx.user.id) });
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return { ok: true }; // No tiene 2FA activo: nada que verificar.
    }

    const valid = await verifyTotpCode(user.twoFactorSecret, parsedInput.code);
    if (!valid) throw new Error("Código incorrecto.");

    await setVerifiedCookie(ctx.user.id);
    return { ok: true };
  });
