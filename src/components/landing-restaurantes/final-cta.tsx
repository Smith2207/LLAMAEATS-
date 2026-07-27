import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCtaRestaurantes() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-terracota-600 via-terracota-500 to-titicaca-700 px-8 py-12 text-center shadow-xl">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Tu mesa te espera. Tus comensales también.
        </h2>
        <p className="mt-3 text-sand-100/90">
          Regístrate hoy y arma tu perfil en minutos — la revisión la hace nuestro equipo.
        </p>
        <div className="mt-6">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-terracota-600 shadow-lg transition-transform hover:scale-[1.03] hover:bg-sand-100"
          >
            <Link href="/iniciar-sesion">Registrar mi restaurante</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
