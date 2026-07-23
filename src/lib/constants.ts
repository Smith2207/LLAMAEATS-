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
  pendiente: "Pendiente de pago",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
  no_asistio: "No asistió",
};

export const RESTAURANT_STATUS_LABELS: Record<string, string> = {
  pendiente: "En revisión",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
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
export const RESERVATION_EXPIRY_MINUTES = 15;
export const FREE_CANCELLATION_WINDOW_HOURS = 2;

export const LIMA_TIME_ZONE = "America/Lima";

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
