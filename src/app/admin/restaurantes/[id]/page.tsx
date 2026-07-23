import { notFound } from "next/navigation";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { getRestaurantById } from "@/lib/restaurants/queries";
import { ModerationActions } from "@/components/dashboard-admin/moderation-actions";
import { Badge } from "@/components/ui/badge";
import { RESTAURANT_CATEGORIES, RESTAURANT_STATUS_LABELS } from "@/lib/constants";

export default async function AdminRestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const restaurant = await getRestaurantById(id);
  if (!restaurant) notFound();

  const categoryLabel =
    RESTAURANT_CATEGORIES.find((c) => c.value === restaurant.category)?.label ??
    restaurant.category;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">{restaurant.name}</h1>
        <Badge>{RESTAURANT_STATUS_LABELS[restaurant.status]}</Badge>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Categoría</dt>
          <dd className="text-foreground">{categoryLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Distrito</dt>
          <dd className="text-foreground">{restaurant.district}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Dirección</dt>
          <dd className="text-foreground">{restaurant.address ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Horario</dt>
          <dd className="text-foreground">
            {restaurant.openTime.slice(0, 5)} – {restaurant.closeTime.slice(0, 5)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Dueño</dt>
          <dd className="text-foreground">{restaurant.owner.name ?? restaurant.owner.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Mesas registradas</dt>
          <dd className="text-foreground">{restaurant.tables.length}</dd>
        </div>
      </dl>

      {restaurant.description && (
        <p className="mt-6 text-sm text-muted-foreground">{restaurant.description}</p>
      )}

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-4">
        <p className="text-sm font-medium text-foreground">Identidad tributaria (RUC)</p>
        {restaurant.ruc ? (
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-foreground">RUC: {restaurant.ruc}</p>
            {restaurant.rucVerifiedAt ? (
              <p className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle2 className="size-4 shrink-0" />
                Verificado con SUNAT — {restaurant.razonSocial} · {restaurant.sunatEstado} ·{" "}
                {restaurant.sunatCondicion}
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-primary">
                <ShieldAlert className="size-4 shrink-0" />
                No verificado automáticamente. Confirma el RUC manualmente antes de aprobar.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
            <ShieldAlert className="size-4 shrink-0" />
            Este restaurante no tiene RUC registrado.
          </p>
        )}
      </div>

      <div className="mt-8">
        <ModerationActions restaurantId={restaurant.id} status={restaurant.status} />
      </div>
    </main>
  );
}
