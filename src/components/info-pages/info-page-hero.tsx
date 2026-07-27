"use client";

import { SplitTextReveal } from "@/components/animations/split-text";

export function InfoPageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 0%, rgba(95,168,211,0.14), transparent), radial-gradient(60% 50% at 100% 100%, rgba(193,80,46,0.10), transparent)",
        }}
      />
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center">
        <span className="glass rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-terracota-400">
          {eyebrow}
        </span>
        <SplitTextReveal as="h1" className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          {title}
        </SplitTextReveal>
        {description && (
          <p className="max-w-xl text-balance text-muted-foreground">{description}</p>
        )}
      </div>
    </section>
  );
}
