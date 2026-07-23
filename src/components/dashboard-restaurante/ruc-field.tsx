"use client";

import { useState } from "react";
import { Controller, type Control, type FieldErrors, type FieldValues, type Path } from "react-hook-form";
import { useAction } from "next-safe-action/hooks";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { lookupRucAction } from "@/actions/restaurants/lookup-ruc";

export function RucField<T extends FieldValues & { ruc: string }>({
  control,
  errors,
}: {
  control: Control<T>;
  errors: FieldErrors<T>;
}) {
  const [result, setResult] = useState<
    | { found: true; razonSocial: string; estado: string; condicion: string }
    | { found: false }
    | null
  >(null);

  const { execute, isExecuting } = useAction(lookupRucAction, {
    onSuccess({ data }) {
      setResult(data ?? { found: false });
    },
    onError() {
      setResult({ found: false });
    },
  });

  return (
    <Controller
      control={control}
      name={"ruc" as Path<T>}
      render={({ field }) => (
        <Field>
          <FieldLabel htmlFor="ruc">RUC de la empresa</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="ruc"
              inputMode="numeric"
              maxLength={11}
              placeholder="20123456789"
              {...field}
              onChange={(e) => {
                field.onChange(e);
                setResult(null);
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isExecuting || !/^\d{11}$/.test(field.value ?? "")}
              onClick={() => execute({ ruc: field.value })}
            >
              {isExecuting ? <Loader2 className="size-4 animate-spin" /> : "Verificar"}
            </Button>
          </div>
          <FieldError errors={[errors.ruc as { message?: string } | undefined]} />

          {result?.found && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-500">
              <CheckCircle2 className="size-4 shrink-0" />
              {result.razonSocial} · {result.estado} · {result.condicion}
            </p>
          )}
          {result && !result.found && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldAlert className="size-4 shrink-0" />
              No pudimos verificarlo automáticamente. Igual puedes enviarlo — un admin lo
              revisará a mano.
            </p>
          )}
        </Field>
      )}
    />
  );
}
