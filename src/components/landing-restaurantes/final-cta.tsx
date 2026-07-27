import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCtaRestaurantes() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
        Tu mesa te espera. Tus comensales también.
      </h2>
      <p className="mt-3 text-muted-foreground">
        Regístrate hoy y arma tu perfil en minutos — la revisión la hace nuestro equipo.
      </p>
      <div className="mt-6">
        <Button asChild size="lg">
          <Link href="/iniciar-sesion">Registrar mi restaurante</Link>
        </Button>
      </div>
    </section>
  );
}
