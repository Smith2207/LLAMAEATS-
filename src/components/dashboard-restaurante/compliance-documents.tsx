"use client";

import { useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { FileCheck, ShieldAlert, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  uploadHealthCertificateAction,
  uploadMunicipalLicenseAction,
} from "@/actions/restaurants/upload-compliance-document";

type DocState = {
  url: string | null;
  expiresAt: string | null;
};

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return expiresAt < new Date().toISOString().slice(0, 10);
}

function DocumentStatus({ url, expiresAt }: DocState) {
  if (!url) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <ShieldAlert className="size-4 shrink-0" />
        Sin documento cargado.
      </p>
    );
  }
  return (
    <p
      className={`flex items-center gap-1.5 text-sm ${isExpired(expiresAt) ? "text-destructive" : "text-success"}`}
    >
      {isExpired(expiresAt) ? <ShieldAlert className="size-4 shrink-0" /> : <FileCheck className="size-4 shrink-0" />}
      {isExpired(expiresAt) ? "Vencido" : "Vigente"} · vence el {expiresAt} ·{" "}
      <a href={url} target="_blank" rel="noreferrer" className="underline">
        ver documento
      </a>
    </p>
  );
}

export function MunicipalLicenseUpload({
  initialUrl,
  initialNumber,
  initialExpiresAt,
}: {
  initialUrl: string | null;
  initialNumber: string | null;
  initialExpiresAt: string | null;
}) {
  const [state, setState] = useState<DocState>({ url: initialUrl, expiresAt: initialExpiresAt });
  const [number, setNumber] = useState(initialNumber ?? "");
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const { execute, isExecuting } = useAction(uploadMunicipalLicenseAction, {
    onSuccess({ data }) {
      if (!data) return;
      setState({ url: data.url, expiresAt });
      toast.success("Licencia municipal actualizada.");
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo subir la licencia.");
    },
  });

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <p className="text-sm font-medium text-foreground">Licencia municipal de funcionamiento</p>
      <div className="mt-2">
        <DocumentStatus url={state.url} expiresAt={state.expiresAt} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="license-number">Número de licencia</FieldLabel>
          <Input id="license-number" value={number} onChange={(e) => setNumber(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="license-expires">Fecha de vencimiento</FieldLabel>
          <Input
            id="license-expires"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </Field>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) execute({ file, number, expiresAt });
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 gap-2"
        disabled={isExecuting || !number || !expiresAt}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" />
        {isExecuting ? "Subiendo..." : "Subir documento (PDF o foto)"}
      </Button>
    </div>
  );
}

export function HealthCertificateUpload({
  initialUrl,
  initialExpiresAt,
}: {
  initialUrl: string | null;
  initialExpiresAt: string | null;
}) {
  const [state, setState] = useState<DocState>({ url: initialUrl, expiresAt: initialExpiresAt });
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const { execute, isExecuting } = useAction(uploadHealthCertificateAction, {
    onSuccess({ data }) {
      if (!data) return;
      setState({ url: data.url, expiresAt });
      toast.success("Certificado sanitario actualizado.");
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo subir el certificado.");
    },
  });

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <p className="text-sm font-medium text-foreground">Certificado sanitario / carné de manipulación</p>
      <div className="mt-2">
        <DocumentStatus url={state.url} expiresAt={state.expiresAt} />
      </div>
      <div className="mt-3">
        <Field>
          <FieldLabel htmlFor="health-expires">Fecha de vencimiento</FieldLabel>
          <Input
            id="health-expires"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </Field>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) execute({ file, expiresAt });
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 gap-2"
        disabled={isExecuting || !expiresAt}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" />
        {isExecuting ? "Subiendo..." : "Subir documento (PDF o foto)"}
      </Button>
    </div>
  );
}
