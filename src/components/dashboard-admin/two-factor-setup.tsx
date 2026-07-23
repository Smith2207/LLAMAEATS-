"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  confirmTwoFactorAction,
  disableTwoFactorAction,
  enrollTwoFactorAction,
} from "@/actions/users/two-factor";

export function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const enroll = useAction(enrollTwoFactorAction, {
    onSuccess({ data }) {
      if (!data) return;
      setSecret(data.secret);
      import("qrcode").then((QRCode) =>
        QRCode.toDataURL(data.otpauthUri, { margin: 1, width: 240 }).then(setQrDataUrl),
      );
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo generar el código QR.");
    },
  });

  const confirm = useAction(confirmTwoFactorAction, {
    onSuccess() {
      toast.success("Verificación en dos pasos activada.");
      setQrDataUrl(null);
      setSecret(null);
      setCode("");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "Código incorrecto.");
    },
  });

  const disable = useAction(disableTwoFactorAction, {
    onSuccess() {
      toast.success("Verificación en dos pasos desactivada.");
      setCode("");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "Código incorrecto.");
    },
  });

  if (enabled) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <p className="flex items-center gap-1.5 text-sm text-success">
          <ShieldCheck className="size-4 shrink-0" />
          Verificación en dos pasos activada.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código para desactivar"
            inputMode="numeric"
            maxLength={6}
            className="w-48"
          />
          <Button
            type="button"
            variant="outline"
            className="text-destructive"
            disabled={disable.isExecuting || code.length !== 6}
            onClick={() => disable.execute({ code })}
          >
            {disable.isExecuting ? "Desactivando..." : "Desactivar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <p className="flex items-center gap-1.5 text-sm text-terracota-400">
        <ShieldAlert className="size-4 shrink-0" />
        Verificación en dos pasos desactivada.
      </p>

      {!qrDataUrl ? (
        <Button
          type="button"
          className="mt-3 gap-2"
          disabled={enroll.isExecuting}
          onClick={() => enroll.execute({})}
        >
          {enroll.isExecuting ? "Generando..." : "Activar verificación en dos pasos"}
        </Button>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Escanea este código con Google Authenticator, Authy, 1Password u otra app TOTP.
          </p>
          <Image src={qrDataUrl} alt="Código QR de verificación en dos pasos" width={200} height={200} className="rounded-lg" />
          <p className="text-xs text-muted-foreground">
            O ingresa manualmente: <code className="rounded bg-muted px-1.5 py-0.5">{secret}</code>
          </p>
          <Field>
            <FieldLabel htmlFor="confirm-code">Código de la app</FieldLabel>
            <Input
              id="confirm-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
            />
          </Field>
          <Button
            type="button"
            className="w-fit gap-2"
            disabled={confirm.isExecuting || code.length !== 6}
            onClick={() => confirm.execute({ code })}
          >
            <CheckCircle2 className="size-4" />
            {confirm.isExecuting ? "Confirmando..." : "Confirmar y activar"}
          </Button>
        </div>
      )}
    </div>
  );
}
