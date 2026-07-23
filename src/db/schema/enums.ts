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

export const restaurantStatusEnum = pgEnum("restaurant_status", [
  "pendiente",
  "aprobado",
  "rechazado",
]);

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
