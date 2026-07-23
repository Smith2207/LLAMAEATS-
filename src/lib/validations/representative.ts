import { z } from "zod";

export const updateRepresentativeSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre completo.").max(120),
  document: z.string().trim().min(6, "Ingresa un documento de identidad válido.").max(20),
  role: z.string().trim().min(2, "Ingresa el cargo (ej. Propietario, Gerente).").max(80),
  email: z.string().trim().email("Correo inválido."),
  phone: z.string().trim().min(6, "Ingresa un celular válido.").max(20),
});

export const verifyRepresentativeEmailSchema = z.object({
  code: z.string().trim().length(6, "El código tiene 6 dígitos."),
});
