import type { Metadata } from "next";
import { InfoPageHero } from "@/components/info-pages/info-page-hero";
import { RevealSection } from "@/components/info-pages/reveal-section";
import { GeneralFaq } from "@/components/info-pages/general-faq";

export const metadata: Metadata = {
  title: "Preguntas frecuentes — LlamaEats",
  description: "Cómo reservar, cancelar, pagar y qué hacer si no hay mesas disponibles.",
};

export default function PreguntasFrecuentesPage() {
  return (
    <main>
      <InfoPageHero
        eyebrow="Ayuda"
        title="Preguntas frecuentes"
        description="Todo lo que necesitas saber antes de reservar tu mesa."
      />
      <RevealSection className="mx-auto max-w-3xl px-4 pb-16">
        <GeneralFaq />
      </RevealSection>
    </main>
  );
}
