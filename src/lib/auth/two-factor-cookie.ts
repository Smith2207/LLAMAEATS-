// Cookie de "2FA verificado en esta sesión", firmada con HMAC-SHA256 sobre
// Web Crypto (`crypto.subtle`) — funciona igual en Node (server actions) y
// en Edge (middleware), sin depender de las tablas internas de Auth.js ni
// de su callback de sesión, así que no hay riesgo de romper el login
// existente: es un mecanismo aparte que solo se consulta para /admin.
export const TWO_FACTOR_COOKIE_NAME = "llamaeats_2fa_verified";
const TWO_FACTOR_TTL_MS = 12 * 60 * 60 * 1000; // 12h — más corto que la sesión misma.

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no está definido.");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signTwoFactorCookie(userId: string): Promise<{ value: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + TWO_FACTOR_TTL_MS);
  const payload = `${userId}.${expiresAt.getTime()}`;
  const key = await hmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return { value: `${payload}.${toHex(signature)}`, expiresAt };
}

export async function verifyTwoFactorCookie(cookieValue: string | undefined, userId: string): Promise<boolean> {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 3) return false;
  const [cookieUserId, expiresAtStr, signatureHex] = parts;
  if (cookieUserId !== userId) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const payload = `${cookieUserId}.${expiresAtStr}`;
  const key = await hmacKey();
  const expectedSignature = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));

  // Comparación en tiempo constante para no filtrar la firma por timing.
  if (expectedSignature.length !== signatureHex.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    diff |= expectedSignature.charCodeAt(i) ^ signatureHex.charCodeAt(i);
  }
  return diff === 0;
}
