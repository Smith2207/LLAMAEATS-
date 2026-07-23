import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "cliente",
  "restaurante",
  "admin",
]);

export const restaurantCategoryEnum = pgEnum("restaurant_category", [
  "vista_al_lago",
  "peña_con_show",
  "comida_tipica",
]);

// Máquina de estados de afiliación (§3 del spec de arquitectura). No incluye
// "borrador": el alta hoy es un formulario de un solo paso sin autoguardado,
// así que ninguna fila llega a existir antes de "enviada" — agregar un
// estado que nada produce ni consume sería un estado fantasma.
// Transiciones: enviada → en_revision → {observada | aprobada | rechazada}
// observada → {enviada (reenvío) | caducada (venció el plazo)}
// aprobada → activa (graduada tras el período de prueba) → {pausada | suspendida}
// pausada/suspendida → activa (reactivación) | dada_de_baja
export const restaurantStatusEnum = pgEnum("restaurant_status", [
  "enviada",
  "en_revision",
  "observada",
  "aprobada",
  "activa",
  "pausada",
  "suspendida",
  "rechazada",
  "caducada",
  "dada_de_baja",
]);

export const riskLevelEnum = pgEnum("risk_level", ["bajo", "medio", "alto"]);

// Máquina de estados del ciclo de vida de una reserva. "pendiente_pago"
// cubre tanto la retención inicial de la mesa como la espera del pago (en
// nuestro flujo ocurren en el mismo instante, así que no se modelan como
// dos estados separados). Los recordatorios (24h/2h) y la confirmación de
// asistencia del comensal son eventos/columnas sobre "confirmada", no
// estados propios: una reserva confirmada sigue confirmada aunque ya se le
// haya mandado el recordatorio.
export const reservationStatusEnum = pgEnum("reservation_status", [
  "pendiente_pago",
  "confirmada",
  "en_curso",
  "completada",
  "expirada",
  "cancelada_comensal",
  "cancelada_local",
  "no_asistio",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pendiente",
  "completado",
  "fallido",
  "reembolsado",
]);

export const scheduleExceptionTypeEnum = pgEnum("schedule_exception_type", [
  "cerrado",
  "horario_especial",
  "evento_privado",
]);
