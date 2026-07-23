import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getRestaurantBySlug, getRestaurantReviews } from "@/lib/restaurants/queries";
import { Gallery } from "@/components/restaurant-detail/gallery";
import { InfoHeader } from "@/components/restaurant-detail/info-header";
import { ReviewList } from "@/components/restaurant-detail/review-list";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  return { title: restaurant ? `${restaurant.name} — LlamaEats` : "LlamaEats" };
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) notFound();

  const reviews = await getRestaurantReviews(restaurant.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Gallery cover={restaurant.coverBlobUrl} images={restaurant.gallery} name={restaurant.name} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <InfoHeader
            name={restaurant.name}
            description={restaurant.description}
            address={restaurant.address}
            district={restaurant.district}
            category={restaurant.category}
            openTime={restaurant.openTime}
            closeTime={restaurant.closeTime}
            avgRating={restaurant.avgRating}
            reviewCount={restaurant.reviewCount}
            rucVerified={Boolean(restaurant.rucVerifiedAt)}
          />

          <Separator className="my-8" />

          <h2 className="font-display text-xl font-semibold text-foreground">Reseñas</h2>
          <div className="mt-4">
            <ReviewList reviews={reviews} />
          </div>
        </div>

        <aside className="h-fit animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border border-border/60 bg-card p-5 lg:sticky lg:top-24">
          <p className="text-sm text-muted-foreground">Reserva tu mesa en minutos</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{restaurant.name}</p>
          <Button asChild size="lg" className="mt-4 w-full">
            <Link href={`/restaurantes/${restaurant.slug}/reservar`}>Reservar mesa</Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Pagas solo la tarifa de servicio de LlamaEats. La cuenta la pagas directo en el
            restaurante.
          </p>
        </aside>
      </div>
    </main>
  );
}
