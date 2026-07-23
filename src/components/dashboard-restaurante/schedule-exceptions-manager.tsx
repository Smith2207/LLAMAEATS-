"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createScheduleExceptionAction,
  deleteScheduleExceptionAction,
} from "@/actions/restaurants/schedule-exceptions";
import { createScheduleExceptionSchema } from "@/lib/validations/schedule-exception";
import type { z } from "zod";

type FormValues = z.infer<typeof createScheduleExceptionSchema>;

const TYPE_LABELS: Record<string, string> = {
  cerrado: "Cerrado",
  horario_especial: "Horario especial",
  evento_privado: "Evento privado (local completo)",
};

export type ScheduleException = {
  id: string;
  date: string;
  type: string;
  openTime: string | null;
  closeTime: string | null;
  note: string | null;
};

export type Holiday = { date: string; name: string; scope: string };

export function ScheduleExceptionsManager({
  exceptions,
  holidays,
}: {
  exceptions: ScheduleException[];
  holidays: Holiday[];
}) {
  const router = useRouter();
  const [type, setType] = useState<FormValues["type"]>("cerrado");
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createScheduleExceptionSchema),
    defaultValues: { date: "", type: "cerrado", openTime: "", closeTime: "", note: "" },
  });

  const { execute, isExecuting } = useAction(createScheduleExceptionAction, {
    onSuccess() {
      toast.success("Excepción guardada.");
      reset({ date: "", type: "cerrado", openTime: "", closeTime: "", note: "" });
      setType("cerrado");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo guardar.");
    },
  });

  const { execute: remove } = useAction(deleteScheduleExceptionAction, {
    onSuccess() {
      toast.success("Excepción eliminada.");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo eliminar.");
    },
  });

  const usedDates = new Set(exceptions.map((e) => e.date));
  const suggestableHolidays = holidays.filter((h) => !usedDates.has(h.date)).slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      {exceptions.length > 0 && (
        <div className="flex flex-col gap-2">
          {exceptions.map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card px-4 py-2.5 text-sm"
            >
              <div>
                <span className="font-medium text-foreground">{e.date}</span>{" "}
                <span className="text-muted-foreground">
                  · {TYPE_LABELS[e.type] ?? e.type}
                  {e.type === "horario_especial" &&
                    e.openTime &&
                    e.closeTime &&
                    ` (${e.openTime.slice(0, 5)}–${e.closeTime.slice(0, 5)})`}
                  {e.note && ` · ${e.note}`}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove({ exceptionId: e.id })}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {suggestableHolidays.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" />
          Próximos feriados:
          {suggestableHolidays.map((h) => (
            <Badge
              key={h.date}
              variant="outline"
              className="cursor-pointer"
              onClick={() => setValue("date", h.date)}
            >
              {h.date} · {h.name}
            </Badge>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit((values) => execute(values))}
        className="grid grid-cols-1 gap-3 rounded-xl border border-border/60 bg-card p-4 sm:grid-cols-2"
      >
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="exception-date">Fecha</FieldLabel>
              <Input
                id="exception-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                {...field}
              />
              <FieldError errors={[errors.date]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  setType(v as FormValues["type"]);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                  <SelectItem value="horario_especial">Horario especial</SelectItem>
                  <SelectItem value="evento_privado">Evento privado (local completo)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        {type === "horario_especial" && (
          <>
            <Controller
              control={control}
              name="openTime"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="exception-open">Apertura</FieldLabel>
                  <Input id="exception-open" type="time" {...field} />
                  <FieldError errors={[errors.openTime]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="closeTime"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="exception-close">Cierre</FieldLabel>
                  <Input id="exception-close" type="time" {...field} />
                </Field>
              )}
            />
          </>
        )}
        <Controller
          control={control}
          name="note"
          render={({ field }) => (
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="exception-note">Nota (opcional)</FieldLabel>
              <Input id="exception-note" placeholder="Ej. Feriado de Semana Santa" {...field} />
            </Field>
          )}
        />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isExecuting} size="sm">
            {isExecuting ? "Guardando..." : "Agregar excepción"}
          </Button>
        </div>
      </form>
    </div>
  );
}
