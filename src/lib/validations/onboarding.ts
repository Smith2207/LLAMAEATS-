import { z } from "zod";

export const onboardingSchema = z.object({
  role: z.enum(["cliente", "restaurante"], {
    error: "Elige un tipo de cuenta.",
  }),
  phone: z
    .string()
    .trim()
    .min(6, "Ingresa un número de teléfono válido.")
    .max(20, "Ingresa un número de teléfono válido."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
