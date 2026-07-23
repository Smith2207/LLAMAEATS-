import { ne } from "drizzle-orm";
import { db } from "@/db";
import { restaurants } from "@/db/schema";

export type RiskLevel = "bajo" | "medio" | "alto";
export type RiskAssessment = { level: RiskLevel; signals: string[] };

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Distancia de Levenshtein simple — suficiente para detectar nombres casi idénticos. */
function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function namesAreSimilar(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const distance = levenshtein(na, nb);
  return distance <= Math.max(2, Math.floor(Math.min(na.length, nb.length) * 0.15));
}

/**
 * Puntaje de riesgo automático (§3.3), calculado antes de que un humano
 * revise. Solo usa señales que el sistema puede calcular hoy sin
 * infraestructura externa nueva (sin geocodificación real, sin banco de
 * datos de solicitudes rechazadas por email/celular — ver nota en el
 * commit). Umbrales: cualquier señal fuerte → alto; una señal débil → medio;
 * ninguna → bajo.
 */
export async function assessRestaurantRisk(input: {
  restaurantId?: string; // excluir la propia fila al reenviar
  name: string;
  address: string | undefined;
  district: string;
  rucVerifiedAt: Date | null;
  sunatEstado: string | null;
  sunatCondicion: string | null;
}): Promise<RiskAssessment> {
  const signals: string[] = [];
  let hasStrongSignal = false;

  if (input.sunatEstado && input.sunatEstado.toUpperCase() !== "ACTIVO") {
    signals.push(`RUC con estado "${input.sunatEstado}" (no activo)`);
    hasStrongSignal = true;
  }
  if (input.sunatCondicion && input.sunatCondicion.toUpperCase() !== "HABIDO") {
    signals.push(`RUC con condición "${input.sunatCondicion}" (no habido)`);
    hasStrongSignal = true;
  }
  if (!input.rucVerifiedAt) {
    signals.push("RUC no verificado automáticamente con SUNAT");
  }

  const peers = await db.query.restaurants.findMany({
    where: input.restaurantId ? ne(restaurants.id, input.restaurantId) : undefined,
    columns: { id: true, name: true, address: true, district: true, status: true },
  });

  const activePeers = peers.filter((p) =>
    ["aprobada", "activa", "en_revision", "observada", "enviada"].includes(p.status),
  );

  if (activePeers.some((p) => namesAreSimilar(p.name, input.name))) {
    signals.push("Nombre comercial muy similar a uno ya registrado (posible suplantación de marca)");
    hasStrongSignal = true;
  }

  if (
    input.address &&
    activePeers.some(
      (p) =>
        p.district === input.district &&
        p.address &&
        normalizeName(p.address) === normalizeName(input.address!),
    )
  ) {
    signals.push("Dirección duplicada de un local ya afiliado en el mismo distrito");
    hasStrongSignal = true;
  }

  const level: RiskLevel = hasStrongSignal ? "alto" : signals.length > 0 ? "medio" : "bajo";
  return { level, signals };
}

