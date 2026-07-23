import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createScheduleExceptionSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    type: z.enum(["cerrado", "horario_especial", "evento_privado"]),
    openTime: z.string().regex(timeRegex, "Hora inválida").optional(),
    closeTime: z.string().regex(timeRegex, "Hora inválida").optional(),
    note: z.string().trim().max(200).optional(),
  })
  .refine(
    (v) => v.type !== "horario_especial" || (v.openTime && v.closeTime && v.openTime < v.closeTime),
    {
      message: "Indica un horario de apertura y cierre válido.",
      path: ["openTime"],
    },
  );

export const scheduleExceptionIdSchema = z.object({ exceptionId: z.string() });
