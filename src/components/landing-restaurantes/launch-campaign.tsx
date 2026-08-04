import { Rocket } from "lucide-react";
import { CAMPAIGN_NAME } from "@/lib/constants";

export function LaunchCampaign() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border border-terracota-400/30 bg-gradient-to-br from-terracota-500/10 via-transparent to-lake-glow/15 p-8 text-center">
        <Rocket className="mx-auto size-8 text-terracota-400" />
        <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
          Estamos en campaña de lanzamiento: &quot;{CAMPAIGN_NAME}&quot;
        </h2>
        <p className="mt-3 text-muted-foreground">
          LlamaEats recién está incorporando a los primeros restaurantes aliados de Puno. Sé de los
          primeros en tu zona en aparecer en la plataforma — sin listas de espera de meses ni
          contratos largos.
        </p>
      </div>
    </section>
  );
}
