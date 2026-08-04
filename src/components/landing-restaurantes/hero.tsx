"use client";

import Link from "next/link";
import { SplitTextReveal } from "@/components/animations/split-text";
import { ScrollParallax } from "@/components/animations/scroll-parallax";
import { Button } from "@/components/ui/button";
import { CAMPAIGN_NAME } from "@/lib/constants";

export function HeroRestaurantes() {
  return (
    <section className="relative flex min-h-[70svh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <ScrollParallax speed={0.25} className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(65% 55% at 50% 15%, rgba(95,168,211,0.24), transparent), radial-gradient(85% 65% at 85% 95%, rgba(193,80,46,0.20), transparent), linear-gradient(180deg, #ffffff 0%, #f7f5f1 55%, #ffffff 100%)",
            }}
          />
        </ScrollParallax>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center">
        <span className="glass rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-terracota-400">
          Campaña {CAMPAIGN_NAME} — para restaurantes
        </span>

        <SplitTextReveal
          as="h1"
          className="font-display text-4xl font-bold text-foreground sm:text-5xl"
        >
          Menos mesas vacías, menos llamadas perdidas
        </SplitTextReveal>

        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          LlamaEats te trae comensales que ya pagaron por asegurar su mesa. Tú manejas tu agenda
          desde un panel — nunca tocamos el dinero de tu cuenta.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-terracota-500 to-terracota-600 shadow-lg shadow-terracota-600/20 transition-all hover:scale-[1.02] hover:from-terracota-400 hover:to-terracota-500 hover:shadow-xl hover:shadow-terracota-600/30 sm:w-auto"
          >
            <Link href="/iniciar-sesion">Registrar mi restaurante</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#como-funciona">Ver cómo funciona</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
