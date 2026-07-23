import { SplitTextReveal } from "@/components/animations/split-text";
import { BRAND_TAGLINE } from "@/lib/constants";

export function BrandMessage() {
  return (
    <section className="border-y border-border/60 bg-secondary/30 py-20">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <SplitTextReveal
          as="h2"
          className="text-balance font-display text-2xl font-bold text-foreground sm:text-4xl"
        >
          {BRAND_TAGLINE}
        </SplitTextReveal>
      </div>
    </section>
  );
}
