"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { CheckCircle2, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  sendRepresentativeEmailCodeAction,
  updateRepresentativeAction,
  verifyRepresentativeEmailCodeAction,
} from "@/actions/restaurants/representative";
import { updateRepresentativeSchema } from "@/lib/validations/representative";
import type { z } from "zod";

type FormValues = z.infer<typeof updateRepresentativeSchema>;

export function RepresentativeForm({
  defaultValues,
  emailVerified,
}: {
  defaultValues: FormValues;
  emailVerified: boolean;
}) {
  const [verified, setVerified] = useState(emailVerified);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [savedEmail, setSavedEmail] = useState(defaultValues.email);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updateRepresentativeSchema),
    defaultValues,
  });
  const currentEmail = watch("email");

  const { execute: save, isExecuting: isSaving } = useAction(updateRepresentativeAction, {
    onSuccess({ data }) {
      toast.success("Datos del representante guardados.");
      setSavedEmail(currentEmail);
      if (data?.emailChanged) {
        setVerified(false);
        setCodeSent(false);
      }
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo guardar.");
    },
  });

  const { execute: sendCode, isExecuting: isSendingCode } = useAction(sendRepresentativeEmailCodeAction, {
    onSuccess() {
      toast.success("Código enviado a tu correo.");
      setCodeSent(true);
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo enviar el código.");
    },
  });

  const { execute: verifyCode, isExecuting: isVerifying } = useAction(verifyRepresentativeEmailCodeAction, {
    onSuccess() {
      toast.success("Correo verificado.");
      setVerified(true);
      setCodeSent(false);
      setCode("");
    },
    onError({ error }) {
      toast.error(error.serverError ?? "Código incorrecto.");
    },
  });

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <form onSubmit={handleSubmit((values) => save(values))}>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="rep-name">Nombre completo</FieldLabel>
                  <Input id="rep-name" {...field} />
                  <FieldError errors={[errors.name]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="document"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="rep-document">Documento de identidad</FieldLabel>
                  <Input id="rep-document" {...field} />
                  <FieldError errors={[errors.document]} />
                </Field>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="rep-role">Cargo</FieldLabel>
                  <Input id="rep-role" placeholder="Ej. Propietario, Gerente" {...field} />
                  <FieldError errors={[errors.role]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="rep-phone">Celular de contacto</FieldLabel>
                  <Input id="rep-phone" type="tel" {...field} />
                  <FieldError errors={[errors.phone]} />
                </Field>
              )}
            />
          </div>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="rep-email">Correo del representante</FieldLabel>
                <Input id="rep-email" type="email" {...field} />
                <FieldError errors={[errors.email]} />
              </Field>
            )}
          />
          <Button type="submit" disabled={isSaving} className="w-fit" size="sm">
            {isSaving ? "Guardando..." : "Guardar datos"}
          </Button>
        </FieldGroup>
      </form>

      <div className="mt-4 border-t border-border/60 pt-4">
        {verified ? (
          <p className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="size-4 shrink-0" />
            Correo verificado.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-1.5 text-sm text-terracota-400">
              <ShieldAlert className="size-4 shrink-0" />
              Correo sin verificar. Guarda tus datos y verifica con un código de 6 dígitos.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isSendingCode || currentEmail !== savedEmail}
                onClick={() => sendCode({ email: savedEmail })}
              >
                <Mail className="size-4" />
                {isSendingCode ? "Enviando..." : codeSent ? "Reenviar código" : "Enviar código"}
              </Button>
              {codeSent && (
                <>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-28"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={isVerifying || code.length !== 6}
                    onClick={() => verifyCode({ code })}
                  >
                    {isVerifying ? "Verificando..." : "Verificar"}
                  </Button>
                </>
              )}
            </div>
            {currentEmail !== savedEmail && (
              <p className="text-xs text-muted-foreground">
                Guarda el nuevo correo antes de enviar el código.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
