import { z } from "zod";

export const totpCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "El código debe tener 6 dígitos."),
});
