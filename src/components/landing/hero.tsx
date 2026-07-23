"use client";

import Link from "next/link";
import { SplitTextReveal } from "@/components/animations/split-text";
import { ScrollParallax } from "@/components/animations/scroll-parallax";
import { SubmitButton } from "@/components/shared/submit-button";
import { GoogleIcon } from "@/components/shared/google-icon";
import { Button } from "@/components/ui/button";
import { CAMPAIGN_NAME } from "@/lib/constants";

export function Hero({ onGoogleSignIn }: { onGoogleSignIn: () => Promise<void> }) {
  return (
    <section className="relative flex min-h-[90svh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <ScrollParallax speed={0.25} className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 20%, rgba(95,168,211,0.25), transparent), radial-gradient(80% 60% at 80% 90%, rgba(193,80,46,0.18), transparent), linear-gradient(180deg, #071A2C 0%, #0E2A44 55%, #071A2C 100%)",
            }}
          />
        </ScrollParallax>
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_30%,#F5EFE6_1px,transparent_0),radial-gradient(1px_1px_at_70%_15%,#F5EFE6_1px,transparent_0),radial-gradient(1px_1px_at_40%_60%,#F5EFE6_1px,transparent_0),radial-gradient(1px_1px_at_85%_70%,#F5EFE6_1px,transparent_0)] opacity-30" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center">
        <span className="glass rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          Campaña {CAMPAIGN_NAME}
        </span>

        <SplitTextReveal
          as="h1"
          className="font-display text-4xl font-bold text-foreground sm:text-6xl"
        >
          Tu mesa en Puno, asegurada en minutos
        </SplitTextReveal>

        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          Reserva mesa en los mejores restaurantes del lago Titicaca en tres pasos, desde tu
          celular, antes de llegar.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <form action={onGoogleSignIn}>
            <SubmitButton size="lg" className="w-full gap-2 sm:w-auto" pendingLabel="Redirigiendo...">
              <GoogleIcon className="size-4" />
              Continuar con Google
            </SubmitButton>
          </form>
          <Button asChild size="lg" variant="outline">
            <Link href="/buscar">Explorar restaurantes</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
