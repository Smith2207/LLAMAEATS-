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

export const reservationStatusEnum = pgEnum("reservation_status", [
  "pendiente",
  "confirmada",
  "cancelada",
  "completada",
  "no_asistio",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pendiente",
  "completado",
  "fallido",
  "reembolsado",
]);
