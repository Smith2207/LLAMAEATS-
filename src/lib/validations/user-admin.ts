import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre.").max(80),
  phone: z.string().trim().min(6, "Ingresa un teléfono válido.").max(20),
});

export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["cliente", "restaurante", "admin"]),
});

export const deactivateUserSchema = z.object({
  userId: z.string(),
});
