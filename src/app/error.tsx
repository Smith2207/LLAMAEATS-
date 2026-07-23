"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
        <h1 className="font-display text-2xl font-bold">Algo salió mal</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tuvimos un problema al cargar esta página. Puedes intentarlo de nuevo o volver al
          inicio.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => reset()} variant="outline">
            Reintentar
          </Button>
          <Button asChild>
            <Link href="/">Ir al inicio</Link>
          </Button>
        </div>
      </body>
    </html>
  );
}
