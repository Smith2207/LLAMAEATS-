import type { Metadata } from "next";
import { ShieldCheck, Handshake, MapPinned } from "lucide-react";
import { InfoPageHero } from "@/components/info-pages/info-page-hero";
import { RevealSection } from "@/components/info-pages/reveal-section";

export const metadata: Metadata = {
  title: "Quiénes somos — LlamaEats",
  description: "Qué es LlamaEats, por qué existe y cómo funciona el modelo de comisión.",
};

const PILLARS = [
  {
    icon: Handshake,
    title: "Somos intermediarios, no dueños del negocio",
    description:
      "LlamaEats conecta comensales con restaurantes de Puno. Nunca procesamos el pago de tu cuenta — eso se sigue pagando en el local, como siempre. Reservar es gratis para ti: cobramos una comisión al restaurante solo cuando tu reserva se atiende.",
  },
  {
    icon: ShieldCheck,
    title: "Restaurantes verificados",
    description:
      "Cada restaurante pasa por una revisión antes de aparecer en la plataforma: licencia municipal, certificado sanitario y un período de prueba con reservas limitadas antes de quedar activo sin tope.",
  },
  {
    icon: MapPinned,
    title: "Hecho para Puno",
    description:
      "No es una copia de una app genérica de reservas. Está pensado para la realidad de reservar mesa en el lago Titicaca: colas telefónicas, restaurantes con vista al lago, peñas con show y comida típica.",
  },
];

export default function NosotrosPage() {
  return (
    <main>
      <InfoPageHero
        eyebrow="Quiénes somos"
        title="Reservar mesa en Puno no debería ser una llamada de suerte"
        description="LlamaEats nació para que asegurar una mesa en tu restaurante favorito tome minutos, no vueltas. Sin filas, sin llamadas sin contestar."
      />

      <RevealSection className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-border/60 bg-card p-6">
              <pillar.icon className="size-7 text-terracota-400" />
              <h2 className="mt-4 font-display font-semibold text-foreground">{pillar.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{pillar.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-foreground">Cómo ganamos dinero</h2>
        <p className="mt-3 text-muted-foreground">
          Nuestro modelo es simple y transparente: reservar tu mesa es gratis para ti. Nuestro
          ingreso es una comisión que le cobramos al restaurante (S/2 a S/4, según cuántas personas
          reservaron) cada vez que tu reserva se atiende de verdad. El precio de tu comida se paga
          directamente en el restaurante, en efectivo o con el método que el local acepte — LlamaEats
          nunca toca ese dinero.
        </p>
      </RevealSection>
    </main>
  );
}
