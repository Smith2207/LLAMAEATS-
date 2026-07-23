"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { verifyTwoFactorLoginAction } from "@/actions/users/two-factor";

export function TwoFactorCodeForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");

  const { execute, isExecuting } = useAction(verifyTwoFactorLoginAction, {
    onSuccess() {
      router.push(redirectTo);
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "Código incorrecto.");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        execute({ code });
      }}
      className="flex flex-col gap-4"
    >
      <Field>
        <FieldLabel htmlFor="totp-code">Código de tu app de autenticación</FieldLabel>
        <Input
          id="totp-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
          autoFocus
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={isExecuting || code.length !== 6}>
        {isExecuting ? "Verificando..." : "Verificar"}
      </Button>
    </form>
  );
}
