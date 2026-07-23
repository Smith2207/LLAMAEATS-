import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-3xl font-bold text-foreground">Página no encontrada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Lo que buscas no existe o ya no está disponible.
      </p>
      <Button asChild>
        <Link href="/">Ir al inicio</Link>
      </Button>
    </main>
  );
}
