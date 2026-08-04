export type RucLookupResult = {
  razonSocial: string;
  estado: string;
  condicion: string;
  direccion?: string;
};

const RUC_REGEX = /^(10|15|17|20)\d{9}$/;

export function isValidRucFormat(ruc: string) {
  return RUC_REGEX.test(ruc);
}

type RespuestaApiPeru = {
  success: boolean;
  data?: {
    ruc: string;
    nombre_o_razon_social: string;
    estado: string;
    condicion: string;
    direccion_completa: string;
  };
};

/**
 * Consulta SUNAT vía apiperu.dev (https://docs.apiperu.dev) — mismo
 * proveedor y token (APIPERU_TOKEN) que ya usan los otros proyectos
 * (ver ECOMERS/src/lib/documento/apiperu.ts) para consultar DNI/RUC.
 * Nunca lanza: si falta el token, la API está caída, o el RUC no existe,
 * devuelve null y el flujo de alta sigue (revisión manual del admin queda
 * como respaldo).
 */
export async function lookupRuc(ruc: string): Promise<RucLookupResult | null> {
  if (!isValidRucFormat(ruc)) return null;

  const token = process.env.APIPERU_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch("https://apiperu.dev/api/ruc", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ruc }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const respuesta = (await res.json()) as RespuestaApiPeru;
    if (!respuesta?.success || !respuesta.data) return null;

    return {
      razonSocial: respuesta.data.nombre_o_razon_social,
      estado: respuesta.data.estado ?? "DESCONOCIDO",
      condicion: respuesta.data.condicion ?? "DESCONOCIDO",
      direccion: respuesta.data.direccion_completa || undefined,
    };
  } catch {
    return null;
  }
}
