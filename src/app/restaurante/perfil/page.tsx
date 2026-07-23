import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getOwnedRestaurant } from "@/lib/restaurants/owner";
import { RestaurantProfileForm } from "@/components/dashboard-restaurante/restaurant-profile-form";
import { CoverUpload } from "@/components/dashboard-restaurante/cover-upload";
import { GalleryUpload } from "@/components/dashboard-restaurante/gallery-upload";
import { ScheduleExceptionsManager } from "@/components/dashboard-restaurante/schedule-exceptions-manager";
import {
  HealthCertificateUpload,
  MunicipalLicenseUpload,
} from "@/components/dashboard-restaurante/compliance-documents";
import { RepresentativeForm } from "@/components/dashboard-restaurante/representative-form";
import { SessionsList } from "@/components/shared/sessions-list";
import { Separator } from "@/components/ui/separator";
import {
  getRestaurantScheduleExceptions,
  getUpcomingHolidays,
} from "@/lib/reservations/schedule";
import { getUserSessions } from "@/lib/users/sessions";
import { getCurrentSessionToken } from "@/lib/auth/current-session";

export default async function RestaurantePerfilPage() {
  const session = await requireRole("restaurante");
  const restaurant = await getOwnedRestaurant(session.user.id);
  if (!restaurant) redirect("/restaurante");

  const [exceptions, holidays, sessions, currentSessionToken] = await Promise.all([
    getRestaurantScheduleExceptions(restaurant.id),
    getUpcomingHolidays(),
    getUserSessions(session.user.id),
    getCurrentSessionToken(),
  ]);

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
          turnoverBufferMinutes: restaurant.turnoverBufferMinutes,
          lastBookingBeforeCloseMinutes: restaurant.lastBookingBeforeCloseMinutes,
        }}
      />

      <Separator className="my-8" />

      <h2 className="font-display text-lg font-semibold text-foreground">
        Excepciones de calendario
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cierres, horarios especiales o eventos privados para una fecha puntual — se aplican por
        encima del horario base.
      </p>
      <div className="mt-4">
        <ScheduleExceptionsManager exceptions={exceptions} holidays={holidays} />
      </div>

      <Separator className="my-8" />

      <h2 className="font-display text-lg font-semibold text-foreground">Documentos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Licencia municipal y certificado sanitario vigentes — te avisamos por correo antes de que
        venzan; si vencen, tu restaurante se suspende automáticamente hasta que los actualices.
      </p>
      <div className="mt-4 flex flex-col gap-4">
        <MunicipalLicenseUpload
          initialUrl={restaurant.municipalLicenseUrl}
          initialNumber={restaurant.municipalLicenseNumber}
          initialExpiresAt={restaurant.municipalLicenseExpiresAt}
        />
        <HealthCertificateUpload
          initialUrl={restaurant.healthCertificateUrl}
          initialExpiresAt={restaurant.healthCertificateExpiresAt}
        />
      </div>

      <Separator className="my-8" />

      <h2 className="font-display text-lg font-semibold text-foreground">Representante</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        La persona responsable del local ante LlamaEats. Verificamos su correo con un código; el
        celular queda como dato de contacto (sin verificación por SMS por ahora).
      </p>
      <div className="mt-4">
        <RepresentativeForm
          defaultValues={{
            name: restaurant.representativeName ?? "",
            document: restaurant.representativeDocument ?? "",
            role: restaurant.representativeRole ?? "",
            email: restaurant.representativeEmail ?? session.user.email ?? "",
            phone: restaurant.representativePhone ?? "",
          }}
          emailVerified={Boolean(restaurant.representativeEmailVerifiedAt)}
        />
      </div>

      <Separator className="my-8" />

      <h2 className="font-display text-lg font-semibold text-foreground">Sesiones activas</h2>
      <div className="mt-4">
        <SessionsList sessions={sessions} currentSessionToken={currentSessionToken} />
      </div>
    </main>
  );
}
