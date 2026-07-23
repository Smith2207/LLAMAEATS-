import { Marquee } from "@/components/animations/marquee";

const PARTNER_RESTAURANTS = [
  "Uros Lounge",
  "Peña Kantuta",
  "La Chacra Puneña",
  "Sabores del Altiplano",
];

export function MarqueeRestaurants() {
  return (
    <section className="py-12">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Restaurantes aliados en Puno
      </p>
      <Marquee items={PARTNER_RESTAURANTS} />
    </section>
  );
}
