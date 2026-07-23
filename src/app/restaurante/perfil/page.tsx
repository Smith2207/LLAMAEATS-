import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getOwnedRestaurant } from "@/lib/restaurants/owner";
import { RestaurantProfileForm } from "@/components/dashboard-restaurante/restaurant-profile-form";
import { CoverUpload } from "@/components/dashboard-restaurante/cover-upload";
import { GalleryUpload } from "@/components/dashboard-restaurante/gallery-upload";
import { Separator } from "@/components/ui/separator";

export default async function RestaurantePerfilPage() {
  const session = await requireRole("restaurante");
  const restaurant = await getOwnedRestaurant(session.user.id);
  if (!restaurant) redirect("/restaurante");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">Perfil del restaurante</h1>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <CoverUpload initialUrl={restaurant.coverBlobUrl} />
        <GalleryUpload initialUrls={restaurant.gallery} />
      </div>

      <Separator className="my-8" />

      <RestaurantProfileForm
        defaultValues={{
          name: restaurant.name,
          description: restaurant.description ?? "",
          address: restaurant.address ?? "",
          district: restaurant.district,
          category: restaurant.category,
          ruc: restaurant.ruc ?? "",
          openTime: restaurant.openTime.slice(0, 5),
          closeTime: restaurant.closeTime.slice(0, 5),
        }}
      />
    </main>
  );
}
