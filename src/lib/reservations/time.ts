import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { LIMA_TIME_ZONE, RESERVATION_BLOCK_MINUTES } from "@/lib/constants";

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

export function isValidSlotForRestaurant(
  date: string,
  time: string,
  openTime: string,
  closeTime: string,
): boolean {
  if (isPastDateTime(date, time)) return false;
  return generateTimeSlots(openTime, closeTime).includes(time);
}
