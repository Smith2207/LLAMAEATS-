import { z } from "zod";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

const documentFileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= MAX_SIZE_BYTES, "El archivo no puede superar 8MB.")
  .refine((f) => ALLOWED_TYPES.has(f.type), "Formato no soportado (usa PDF, JPG, PNG o WEBP).");

const futureDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .refine((d) => new Date(d).getTime() > Date.now(), "La fecha de vencimiento debe ser futura.");

export const uploadMunicipalLicenseSchema = z.object({
  file: documentFileSchema,
  number: z.string().trim().min(1, "Ingresa el número de licencia.").max(60),
  expiresAt: futureDateSchema,
});

export const uploadHealthCertificateSchema = z.object({
  file: documentFileSchema,
  expiresAt: futureDateSchema,
});

export const recordPresencialVisitSchema = z.object({
  restaurantId: z.string(),
  note: z.string().trim().min(1, "Describe brevemente la visita.").max(500),
});
