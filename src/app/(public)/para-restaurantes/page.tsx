import type { Metadata } from "next";
import { HeroRestaurantes } from "@/components/landing-restaurantes/hero";
import { PainPoints } from "@/components/landing-restaurantes/pain-points";
import { FeaturesRestaurantes } from "@/components/landing-restaurantes/features";
import { OnboardingSteps } from "@/components/landing-restaurantes/onboarding-steps";
import { LaunchCampaign } from "@/components/landing-restaurantes/launch-campaign";
import { FaqRestaurantes } from "@/components/landing-restaurantes/faq";
import { FinalCtaRestaurantes } from "@/components/landing-restaurantes/final-cta";

export const metadata: Metadata = {
  title: "Para restaurantes — LlamaEats",
  description:
    "Lleva las reservas de tu restaurante a un solo panel: agenda en vivo, reservas por teléfono, modo sin conexión y comisión transparente.",
};

export default function ParaRestaurantesPage() {
  return (
    <main>
      <HeroRestaurantes />
      <PainPoints />
      <FeaturesRestaurantes />
      <OnboardingSteps />
      <LaunchCampaign />
      <FaqRestaurantes />
      <FinalCtaRestaurantes />
    </main>
  );
}
