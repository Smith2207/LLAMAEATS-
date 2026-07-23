export type RucLookupResult = {
  razonSocial: string;
  estado: string;
  condicion: string;
};

const RUC_REGEX = /^(10|15|17|20)\d{9}$/;

export function isValidRucFormat(ruc: string) {
  return RUC_REGEX.test(ruc);
}

/**
 * Consulta SUNAT vía decolecta.com (antes apis.net.pe — mismo servicio,
 * renombrado; el dominio y el esquema de respuesta cambiaron a snake_case).
 * Plan gratuito: 100 consultas/mes, token en https://decolecta.com/profile.
 * Nunca lanza: si falta el token, la API está caída, o el RUC no existe,
 * devuelve null y el flujo de alta sigue (revisión manual del admin queda
 * como respaldo).
 */
export async function lookupRuc(ruc: string): Promise<RucLookupResult | null> {
  if (!isValidRucFormat(ruc)) return null;

  const token = process.env.RUC_LOOKUP_API_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(`https://api.decolecta.com/v1/sunat/ruc?numero=${ruc}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.razon_social) return null;

    return {
      razonSocial: String(data.razon_social),
      estado: String(data.estado ?? "DESCONOCIDO"),
      condicion: String(data.condicion ?? "DESCONOCIDO"),
    };
  } catch {
    return null;
  }
}
