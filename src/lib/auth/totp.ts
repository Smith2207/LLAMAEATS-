// TOTP (RFC 6238) implementado a mano en vez de agregar una dependencia:
// HMAC-SHA1, 6 dígitos, período de 30s — el estándar que leen Google
// Authenticator, Authy, 1Password, etc. Usa Web Crypto (`crypto.subtle`),
// disponible tanto en Node como en Edge, sin diferencias entre runtimes.

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateBase32Secret(byteLength = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");

  let secret = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    secret += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return secret;
}

function base32Decode(base32: string): Uint8Array<ArrayBuffer> {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const char of clean) {
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const byteCount = Math.floor(bits.length / 8);
  const out = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    out[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return out;
}

function intToBytes(counter: number): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  // JS numbers son seguros hasta 2^53; el contador de pasos de 30s no lo
  // alcanza en ninguna fecha razonable, así que basta con la mitad baja.
  view.setUint32(4, counter);
  return new Uint8Array(buf);
}

async function hmacSha1(
  keyBytes: Uint8Array<ArrayBuffer>,
  message: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, message);
  return new Uint8Array(signature);
}

async function generateTotpAtCounter(secret: string, counter: number): Promise<string> {
  const key = base32Decode(secret);
  const hmac = await hmacSha1(key, intToBytes(counter));

  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 1_000_000).toString().padStart(6, "0");
}

export async function generateTotpCode(secret: string, at: number = Date.now()): Promise<string> {
  return generateTotpAtCounter(secret, Math.floor(at / 1000 / 30));
}

/** Acepta el código del paso actual y ±1 paso (30s) para tolerar reloj desfasado. */
export async function verifyTotpCode(
  secret: string,
  code: string,
  at: number = Date.now(),
): Promise<boolean> {
  const cleanCode = code.trim();
  if (!/^\d{6}$/.test(cleanCode)) return false;

  const counter = Math.floor(at / 1000 / 30);
  for (const drift of [0, -1, 1]) {
    const candidate = await generateTotpAtCounter(secret, counter + drift);
    if (candidate === cleanCode) return true;
  }
  return false;
}

export function totpAuthUri(secret: string, accountLabel: string, issuer = "LlamaEats"): string {
  const label = encodeURIComponent(`${issuer}:${accountLabel}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
