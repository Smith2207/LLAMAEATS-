"use client";

import Link from "next/link";
import { SplitTextReveal } from "@/components/animations/split-text";
import { ScrollParallax } from "@/components/animations/scroll-parallax";
import { ProductPreview, type FeaturedRestaurant } from "@/components/landing/product-preview";
import { SearchFilters } from "@/components/search/search-filters";
import { SubmitButton } from "@/components/shared/submit-button";
import { GoogleIcon } from "@/components/shared/google-icon";
import { Button } from "@/components/ui/button";
import { CAMPAIGN_NAME } from "@/lib/constants";

type HeroSession = { name: string | null; homeHref: string } | null;

export function Hero({
  session,
  onGoogleSignIn,
  featured,
}: {
  session: HeroSession;
  onGoogleSignIn: () => Promise<void>;
  featured: FeaturedRestaurant | null;
}) {
  return (
    <section className="relative flex min-h-[90svh] flex-col justify-center gap-10 overflow-hidden py-16">
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

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
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
              <Button
                asChild
                size="lg"
                className="w-full gap-2 bg-gradient-to-r from-terracota-500 to-terracota-600 shadow-lg shadow-terracota-600/20 transition-all hover:scale-[1.02] hover:from-terracota-400 hover:to-terracota-500 hover:shadow-xl hover:shadow-terracota-600/30 sm:w-auto"
              >
                <Link href={session.homeHref}>Ir a mi panel</Link>
              </Button>
            ) : (
              <form action={onGoogleSignIn}>
                <SubmitButton
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-terracota-500 to-terracota-600 shadow-lg shadow-terracota-600/20 transition-all hover:scale-[1.02] hover:from-terracota-400 hover:to-terracota-500 hover:shadow-xl hover:shadow-terracota-600/30 sm:w-auto"
                  pendingLabel="Redirigiendo..."
                >
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

        <ProductPreview featured={featured} />
      </div>

      {!session && (
        <div className="mx-auto w-full max-w-4xl px-4">
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            O busca mesa ahora mismo
          </p>
          <SearchFilters />
        </div>
      )}
    </section>
  );
}
