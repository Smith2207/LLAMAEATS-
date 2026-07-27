import type { Metadata } from "next";
import { InfoPageHero } from "@/components/info-pages/info-page-hero";
import { RevealSection } from "@/components/info-pages/reveal-section";

export const metadata: Metadata = {
  title: "Términos de servicio — LlamaEats",
  description: "Condiciones de uso de la plataforma de reservas LlamaEats.",
};

export default function TerminosPage() {
  return (
    <main>
      <InfoPageHero eyebrow="Legal" title="Términos de servicio" />
      <RevealSection className="mx-auto max-w-3xl px-4 pb-16">
        <div className="flex flex-col gap-8 text-sm text-muted-foreground">
          <p className="text-xs text-muted-foreground/70">Última actualización: julio de 2026.</p>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Qué es LlamaEats</h2>
            <p className="mt-2">
              LlamaEats es una plataforma intermediaria que conecta comensales con restaurantes de
              Puno, Perú, para reservar mesa. No somos dueños de los restaurantes listados, no
              preparamos ni servimos la comida, y no procesamos el pago de tu consumo — ese pago se
              hace directamente en el restaurante, con el método que el local acepte.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">La tarifa de servicio</h2>
            <p className="mt-2">
              Al reservar, pagas una tarifa de servicio de S/3 a S/5 (según la categoría del
              restaurante) para asegurar tu mesa. Es el único cargo que procesamos. Tienes 10 minutos
              desde que creas la reserva para completar este pago; si no lo haces, la mesa se libera.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Cancelaciones y reprogramaciones
            </h2>
            <p className="mt-2">
              Puedes cancelar tu reserva con reembolso completo de la tarifa de servicio si lo haces
              con más de 2 horas de anticipación al horario reservado. Con menos de 2 horas, la tarifa
              no se reembolsa. Puedes reprogramar una reserva hasta 2 veces, también con más de 2
              horas de anticipación.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">No-asistencia</h2>
            <p className="mt-2">
              Si no llegas al restaurante, este puede marcar tu reserva como no-asistencia pasados 15
              minutos de tolerancia desde el horario reservado. Un historial recurrente de
              no-asistencias puede afectar tu capacidad de reservar en la plataforma.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Responsabilidad del restaurante
            </h2>
            <p className="mt-2">
              Cada restaurante es responsable de la calidad de su comida, servicio, higiene y
              cumplimiento de sus licencias municipales y sanitarias. LlamaEats verifica estos
              documentos al momento del alta y periódicamente, pero no garantiza la operación diaria
              del local.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Cuentas de usuario</h2>
            <p className="mt-2">
              Inicias sesión con tu cuenta de Google o con un enlace mágico por correo. Eres
              responsable de la actividad realizada desde tu cuenta. Puedes exportar o eliminar tus
              datos en cualquier momento desde tu perfil.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Cambios a estos términos</h2>
            <p className="mt-2">
              Podemos actualizar estos términos conforme la plataforma evoluciona. Los cambios
              relevantes se comunicarán por correo o dentro de la plataforma.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Contacto</h2>
            <p className="mt-2">
              Si tienes dudas sobre estos términos, escríbenos desde la plataforma o por los canales
              de soporte indicados en tu panel.
            </p>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
