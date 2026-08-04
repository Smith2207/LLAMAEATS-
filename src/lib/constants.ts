export const RESTAURANT_CATEGORIES = [
  { value: "vista_al_lago", label: "Vista al lago" },
  { value: "peña_con_show", label: "Peña con show" },
  { value: "comida_tipica", label: "Comida típica" },
] as const;

export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number]["value"];

// Comisión que le cobramos al restaurante por cada reserva que atendió
// (mesa liberada, §ver mark-attendance.ts), escalada por tamaño de grupo.
// Reservar es gratis para el comensal — LlamaEats ya no cobra tarifa de
// servicio al cliente.
export function commissionForGuests(guests: number): number {
  if (guests <= 2) return 2;
  if (guests <= 4) return 3;
  return 4;
}

export const PUNO_DISTRICTS = [
  "Puno",
  "Chulluni",
  "Salcedo",
  "Acora",
  "Platería",
  "Paucarcolla",
  "Amantaní",
  "Taquile",
] as const;

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  confirmada: "Confirmada",
  en_curso: "En curso",
  completada: "Completada",
  expirada: "Expirada",
  cancelada_comensal: "Cancelada por el comensal",
  cancelada_local: "Cancelada por el restaurante",
  no_asistio: "No asistió",
};

// Estados que realmente ocupan una mesa hoy (para disponibilidad y agenda).
// Sin `as const`: se compara contra columnas `status: string` leídas de la
// base de datos, no contra el tipo literal del enum.
export const RESERVATION_ACTIVE_STATUSES: string[] = ["pendiente_pago", "confirmada", "en_curso"];

export const RESTAURANT_STATUS_LABELS: Record<string, string> = {
  enviada: "Enviada, en cola",
  en_revision: "En revisión",
  observada: "Observada",
  aprobada: "Aprobada (en prueba)",
  activa: "Activa",
  pausada: "Pausada",
  suspendida: "Suspendida",
  rechazada: "Rechazada",
  caducada: "Caducada",
  dada_de_baja: "Dada de baja",
};

export const RISK_LEVEL_LABELS: Record<string, string> = {
  bajo: "Riesgo bajo",
  medio: "Riesgo medio",
  alto: "Riesgo alto",
};

// Horarios típicos ofrecidos en el filtro de búsqueda (bloques de 90 min).
// La disponibilidad real de cada restaurante se valida aparte contra su
// openTime/closeTime en lib/reservations/time.ts.
export const TIME_SLOT_OPTIONS = [
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00",
  "19:30",
  "21:00",
  "22:30",
] as const;

export const RESERVATION_BLOCK_MINUTES = 90;
// Retención de la mesa mientras se completa el pago (§4.4): si no se paga
// dentro de este plazo, la mesa vuelve automáticamente al inventario.
export const RESERVATION_EXPIRY_MINUTES = 10;
export const FREE_CANCELLATION_WINDOW_HOURS = 2;

// Antelación mínima y máxima para reservar (§4.2).
export const MIN_BOOKING_LEAD_MINUTES = 15;
export const MAX_BOOKING_LEAD_DAYS = 60;

// Tolerancia por defecto antes de marcar una reserva confirmada como
// no-asistencia (§4.5). Hoy el marcado es manual desde el anfitrión; esta
// constante documenta la política aunque el cron automático de no-shows
// queda fuera de esta fase.
export const NO_SHOW_GRACE_MINUTES = 15;

export const LIMA_TIME_ZONE = "America/Lima";

export const ROLE_HOME: Record<string, string> = {
  cliente: "/dashboard",
  restaurante: "/restaurante",
  admin: "/admin",
};

export const BRAND_TAGLINE =
  "¿Cansado de hacer fila para comer en Puno? LlamaEats te asegura tu mesa en minutos.";

// Campaña de lanzamiento ("Tu Mesa Te Espera", mes piloto con los primeros
// restaurantes aliados) — ver actividad de Plaza/Promoción del curso.
export const CAMPAIGN_NAME = "Tu Mesa Te Espera";
export const CAMPAIGN_CTA = "Escanea el código QR o ingresa a llamaeats.pe y reserva ahora.";

// Número de WhatsApp Business para soporte/reclamos, en formato E.164 sin
// "+" (ej. 51987654321). Configurable por variable de entorno.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hola, necesito ayuda con una reserva en LlamaEats.";
