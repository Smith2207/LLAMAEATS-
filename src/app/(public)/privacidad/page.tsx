import Link from "next/link";
import type { Metadata } from "next";
import { InfoPageHero } from "@/components/info-pages/info-page-hero";
import { RevealSection } from "@/components/info-pages/reveal-section";

export const metadata: Metadata = {
  title: "Privacidad — LlamaEats",
  description: "Qué datos recopila LlamaEats, para qué los usa y cómo ejercer tus derechos ARCO.",
};

export default function PrivacidadPage() {
  return (
    <main>
      <InfoPageHero eyebrow="Legal" title="Política de privacidad" />
      <RevealSection className="mx-auto max-w-3xl px-4 pb-16">
        <div className="flex flex-col gap-8 text-sm text-muted-foreground">
          <p className="text-xs text-muted-foreground/70">
            Última actualización: julio de 2026. Tratamos tus datos conforme a la Ley N.º 29733,
            Ley de Protección de Datos Personales del Perú.
          </p>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Qué datos recopilamos</h2>
            <p className="mt-2">
              Nombre, correo y foto de perfil (desde tu cuenta de Google, si inicias sesión así) o
              solo tu correo (si usas el enlace mágico); tu número de teléfono, que agregas al
              completar tu perfil; e historial de reservas, reseñas y pagos de la tarifa de servicio
              hechos en la plataforma.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Para qué los usamos</h2>
            <p className="mt-2">
              Para operar tu reserva (confirmarla, enviarte el código y QR, avisarte de cambios),
              para que el restaurante pueda contactarte sobre tu mesa, para procesar el cobro de la
              tarifa de servicio, y para enviarte avisos de lista de espera si te anotaste en una.
              Nunca vendemos tus datos a terceros.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Con quién los compartimos
            </h2>
            <p className="mt-2">
              El restaurante donde reservas ve tu nombre, teléfono y los detalles de esa reserva
              específica — necesita esto para atenderte. No compartimos tu información con otros
              restaurantes ni con anunciantes.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Cookies y sesión</h2>
            <p className="mt-2">
              Usamos una cookie de sesión para mantenerte conectado. No usamos cookies de rastreo
              publicitario de terceros.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Tus derechos ARCO (acceso, rectificación, cancelación, oposición)
            </h2>
            <p className="mt-2">
              Desde tu perfil puedes descargar en cualquier momento un archivo con todos tus datos:
              perfil, reservas y reseñas. Si tienes cuenta de cliente, también puedes eliminar tu
              cuenta directamente — anonimizamos tu perfil y cerramos tu sesión en todos los
              dispositivos, conservando únicamente los registros de reservas/pagos que la ley exige
              para contabilidad, sin datos que te identifiquen.
            </p>
            <p className="mt-2">
              Encuentras ambas opciones en{" "}
              <Link href="/dashboard/perfil" className="text-terracota-400 underline underline-offset-2">
                tu perfil
              </Link>
              . Si tienes una cuenta de restaurante, escríbenos por los canales de soporte de tu
              panel para gestionar la baja.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Cambios a esta política</h2>
            <p className="mt-2">
              Podemos actualizar esta política conforme la plataforma evoluciona. Los cambios
              relevantes se comunicarán por correo o dentro de la plataforma.
            </p>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
