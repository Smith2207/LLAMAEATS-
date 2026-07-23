"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateRestaurantProfileAction } from "@/actions/restaurants/update-restaurant-profile";
import { updateRestaurantProfileSchema } from "@/lib/validations/restaurant";
import { PUNO_DISTRICTS, RESTAURANT_CATEGORIES } from "@/lib/constants";
import type { z } from "zod";

type FormValues = z.infer<typeof updateRestaurantProfileSchema>;

export function RestaurantProfileForm({ defaultValues }: { defaultValues: FormValues }) {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updateRestaurantProfileSchema),
    defaultValues,
  });

  const { execute, isExecuting } = useAction(updateRestaurantProfileAction, {
    onSuccess() {
      toast.success("Perfil actualizado.");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo guardar.");
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => execute(values))} className="max-w-xl">
      <FieldGroup>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="name">Nombre del restaurante</FieldLabel>
              <Input id="name" {...field} />
              <FieldError errors={[errors.name]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea id="description" {...field} />
              <FieldError errors={[errors.description]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="address">Dirección</FieldLabel>
              <Input id="address" {...field} />
              <FieldError errors={[errors.address]} />
            </Field>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <Field>
                <FieldLabel>Distrito</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUNO_DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Field>
                <FieldLabel>Categoría</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESTAURANT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="openTime"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="openTime">Hora de apertura</FieldLabel>
                <Input id="openTime" type="time" {...field} />
                <FieldError errors={[errors.openTime]} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="closeTime"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="closeTime">Hora de cierre</FieldLabel>
                <Input id="closeTime" type="time" {...field} />
                <FieldError errors={[errors.closeTime]} />
              </Field>
            )}
          />
        </div>

        <Button type="submit" disabled={isExecuting} className="w-fit">
          {isExecuting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </FieldGroup>
    </form>
  );
}
