"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTableAction } from "@/actions/tables/create-table";
import { updateTableAction } from "@/actions/tables/update-table";
import { createTableSchema } from "@/lib/validations/table";
import type { z } from "zod";

type FormInput = z.input<typeof createTableSchema>;
type FormOutput = z.output<typeof createTableSchema>;

type ExistingTable = FormOutput & { id: string };

export function TableForm({ table }: { table?: ExistingTable }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createTableSchema),
    defaultValues:
      table ?? { number: 1, minSeats: 1, seats: 2, zone: "Salón Principal", platformBookable: true },
  });

  const createAction = useAction(createTableAction, {
    onSuccess() {
      toast.success("Mesa agregada.");
      setOpen(false);
      reset();
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo guardar.");
    },
  });

  const updateAction = useAction(updateTableAction, {
    onSuccess() {
      toast.success("Mesa actualizada.");
      setOpen(false);
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo guardar.");
    },
  });

  const isExecuting = createAction.isExecuting || updateAction.isExecuting;

  function onSubmit(values: FormOutput) {
    if (table) {
      updateAction.execute({ ...values, tableId: table.id });
    } else {
      createAction.execute(values);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {table ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : (
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Nueva mesa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{table ? "Editar mesa" : "Nueva mesa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="number"
                render={({ field: { value, onChange, ...field } }) => (
                  <Field>
                    <FieldLabel htmlFor="number">Número</FieldLabel>
                    <Input
                      id="number"
                      type="number"
                      min={1}
                      value={value as number}
                      onChange={(e) => onChange(e.target.valueAsNumber)}
                      {...field}
                    />
                    <FieldError errors={[errors.number]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="seats"
                render={({ field: { value, onChange, ...field } }) => (
                  <Field>
                    <FieldLabel htmlFor="seats">Asientos (máx.)</FieldLabel>
                    <Input
                      id="seats"
                      type="number"
                      min={1}
                      value={value as number}
                      onChange={(e) => onChange(e.target.valueAsNumber)}
                      {...field}
                    />
                    <FieldError errors={[errors.seats]} />
                  </Field>
                )}
              />
            </div>
            <Controller
              control={control}
              name="minSeats"
              render={({ field: { value, onChange, ...field } }) => (
                <Field>
                  <FieldLabel htmlFor="minSeats">Mínimo de personas</FieldLabel>
                  <Input
                    id="minSeats"
                    type="number"
                    min={1}
                    value={value as number}
                    onChange={(e) => onChange(e.target.valueAsNumber)}
                    {...field}
                  />
                  <FieldError errors={[errors.minSeats]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="zone"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="zone">Zona</FieldLabel>
                  <Input id="zone" placeholder="Ej. Terraza / Vista al lago" {...field} />
                  <FieldError errors={[errors.zone]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="platformBookable"
              render={({ field }) => (
                <Field>
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel htmlFor="platformBookable">Reservable en LlamaEats</FieldLabel>
                      <p className="text-xs text-muted-foreground">
                        Si lo apagas, esta mesa queda solo para mostrador y nunca se ofrece en la
                        plataforma.
                      </p>
                    </div>
                    <Switch
                      id="platformBookable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
