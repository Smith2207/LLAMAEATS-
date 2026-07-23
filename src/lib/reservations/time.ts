import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import {
  LIMA_TIME_ZONE,
  MAX_BOOKING_LEAD_DAYS,
  MIN_BOOKING_LEAD_MINUTES,
  RESERVATION_BLOCK_MINUTES,
} from "@/lib/constants";

/** "HH:mm" o "HH:mm:ss" → minutos desde medianoche. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Genera los bloques de 90 min entre openTime y closeTime (última hora de INICIO). */
export function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const start = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);
  const slots: string[] = [];
  for (let t = start; t + RESERVATION_BLOCK_MINUTES <= end; t += RESERVATION_BLOCK_MINUTES) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

export function todayInLima(): string {
  return formatInTimeZone(new Date(), LIMA_TIME_ZONE, "yyyy-MM-dd");
}

/**
 * Convierte una fecha+hora en horario de Lima (los valores tal cual se
 * guardan/muestran en la app) al instante UTC real que representan. Nunca
 * usar `new Date(`${date}T${time}`)` directo: sin zona horaria explícita, JS
 * lo interpreta con la zona LOCAL DEL PROCESO — correcto en un dev machine en
 * Lima, pero incorrecto en Vercel (que corre en UTC).
 */
export function reservationInstant(date: string, time: string): Date {
  const hhmm = time.slice(0, 5);
  return fromZonedTime(`${date}T${hhmm}:00`, LIMA_TIME_ZONE);
}

/** true si la combinación fecha+hora ya pasó (hora local de Lima). */
export function isPastDateTime(date: string, time: string): boolean {
  return reservationInstant(date, time).getTime() < Date.now();
}

/**
 * Antelación mínima (no reservar para dentro de MIN_BOOKING_LEAD_MINUTES) y
 * máxima (no más de MAX_BOOKING_LEAD_DAYS) — §4.2. `isPastDateTime` ya cubre
 * el caso trivial de una hora que ya pasó; esto además exige un margen
 * mínimo hacia adelante y acota cuán lejos se puede reservar.
 */
export function isWithinBookingLeadWindow(date: string, time: string): boolean {
  const target = reservationInstant(date, time).getTime();
  const now = Date.now();
  const minLeadMs = MIN_BOOKING_LEAD_MINUTES * 60 * 1000;
  const maxLeadMs = MAX_BOOKING_LEAD_DAYS * 24 * 60 * 60 * 1000;
  return target - now >= minLeadMs && target - now <= maxLeadMs;
}

/**
 * Corte de última reserva antes del cierre (§4.2): el bloque completo debe
 * caber antes de closeTime, y además no puede empezar dentro de los
 * `lastBookingBeforeCloseMinutes` previos al cierre.
 */
export function isBeforeClosingCutoff(
  time: string,
  closeTime: string,
  lastBookingBeforeCloseMinutes: number,
): boolean {
  const slotStart = timeToMinutes(time);
  const close = timeToMinutes(closeTime);
  return slotStart + RESERVATION_BLOCK_MINUTES <= close - lastBookingBeforeCloseMinutes;
}

export function isValidSlotForRestaurant(
  date: string,
  time: string,
  openTime: string,
  closeTime: string,
  lastBookingBeforeCloseMinutes = 0,
): boolean {
  if (!isWithinBookingLeadWindow(date, time)) return false;
  if (!isBeforeClosingCutoff(time, closeTime, lastBookingBeforeCloseMinutes)) return false;
  return generateTimeSlots(openTime, closeTime).includes(time);
}
