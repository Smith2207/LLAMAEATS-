"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { updateUserProfileAction } from "@/actions/users/update-user-profile";
import { updateProfileSchema } from "@/lib/validations/user-admin";
import type { z } from "zod";

type FormValues = z.infer<typeof updateProfileSchema>;

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name, phone },
  });

  const { execute, isExecuting } = useAction(updateUserProfileAction, {
    onSuccess() {
      toast.success("Perfil actualizado.");
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo actualizar el perfil.");
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => execute(values))} className="max-w-sm">
      <FieldGroup>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input id="name" {...field} />
              <FieldError errors={[errors.name]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
              <Input id="phone" {...field} />
              <FieldError errors={[errors.phone]} />
            </Field>
          )}
        />
        <Button type="submit" disabled={isExecuting} className="w-fit">
          {isExecuting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </FieldGroup>
    </form>
  );
}
