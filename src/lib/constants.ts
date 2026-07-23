export const RESTAURANT_CATEGORIES = [
  { value: "vista_al_lago", label: "Vista al lago" },
  { value: "peña_con_show", label: "Peña con show" },
  { value: "comida_tipica", label: "Comida típica" },
] as const;

export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number]["value"];

// Tarifa de servicio (S/ 3.00 – S/ 5.00) fijada por categoría: determinística
// y fácil de ajustar sin tocar el flujo de reserva.
export const SERVICE_FEE_BY_CATEGORY: Record<RestaurantCategory, number> = {
  comida_tipica: 3,
  vista_al_lago: 4,
  "peña_con_show": 5,
};

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

// Descuento de lanzamiento: S/1 menos en la tarifa de servicio durante el
// primer mes piloto. Pasada esta fecha, la tarifa vuelve al precio normal
// por categoría (SERVICE_FEE_BY_CATEGORY) sin tocar código.
export const LAUNCH_PROMO_DISCOUNT = 1;
export const LAUNCH_PROMO_END_DATE = "2026-08-22";

// Número de WhatsApp Business para soporte/reclamos, en formato E.164 sin
// "+" (ej. 51987654321). Configurable por variable de entorno.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hola, necesito ayuda con una reserva en LlamaEats.";
