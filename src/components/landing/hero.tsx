"use client";

import Link from "next/link";
import { SplitTextReveal } from "@/components/animations/split-text";
import { ScrollParallax } from "@/components/animations/scroll-parallax";
import { SubmitButton } from "@/components/shared/submit-button";
import { GoogleIcon } from "@/components/shared/google-icon";
import { Button } from "@/components/ui/button";
import { CAMPAIGN_NAME } from "@/lib/constants";

type HeroSession = { name: string | null; homeHref: string } | null;

export function Hero({
  session,
  onGoogleSignIn,
}: {
  session: HeroSession;
  onGoogleSignIn: () => Promise<void>;
}) {
  return (
    <section className="relative flex min-h-[90svh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <ScrollParallax speed={0.25} className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 20%, rgba(95,168,211,0.16), transparent), radial-gradient(80% 60% at 80% 90%, rgba(193,80,46,0.10), transparent), linear-gradient(180deg, #ffffff 0%, #f7f5f1 55%, #ffffff 100%)",
            }}
          />
        </ScrollParallax>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center">
        <span className="glass rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-terracota-400">
          Campaña {CAMPAIGN_NAME}
        </span>

        <SplitTextReveal
          as="h1"
          className="font-display text-4xl font-bold text-foreground sm:text-6xl"
        >
          {session ? `Hola de nuevo${session.name ? `, ${session.name.split(" ")[0]}` : ""}` : "Tu mesa en Puno, asegurada en minutos"}
        </SplitTextReveal>

        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          {session
            ? "Sigue explorando restaurantes o revisa tus reservas desde tu panel."
            : "Reserva mesa en los mejores restaurantes del lago Titicaca en tres pasos, desde tu celular, antes de llegar."}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          {session ? (
            <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
              <Link href={session.homeHref}>Ir a mi panel</Link>
            </Button>
          ) : (
            <form action={onGoogleSignIn}>
              <SubmitButton size="lg" className="w-full gap-2 sm:w-auto" pendingLabel="Redirigiendo...">
                <GoogleIcon className="size-4" />
                Continuar con Google
              </SubmitButton>
            </form>
          )}
          <Button asChild size="lg" variant="outline">
            <Link href="/buscar">Explorar restaurantes</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
