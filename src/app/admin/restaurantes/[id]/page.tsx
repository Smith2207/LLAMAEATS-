import { notFound } from "next/navigation";
import { CheckCircle2, FileCheck, MapPin, ShieldAlert } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { getRestaurantById } from "@/lib/restaurants/queries";
import { ModerationActions } from "@/components/dashboard-admin/moderation-actions";
import { PresencialVisitForm } from "@/components/dashboard-admin/presencial-visit-form";
import { Badge } from "@/components/ui/badge";
import { RESTAURANT_CATEGORIES, RESTAURANT_STATUS_LABELS, RISK_LEVEL_LABELS } from "@/lib/constants";

const today = () => new Date().toISOString().slice(0, 10);

export default async function AdminRestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("admin");
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
        <Badge>{RESTAURANT_STATUS_LABELS[restaurant.status] ?? restaurant.status}</Badge>
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
              <p className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="size-4 shrink-0" />
                Verificado con SUNAT — {restaurant.razonSocial} · {restaurant.sunatEstado} ·{" "}
                {restaurant.sunatCondicion}
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-terracota-400">
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

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Riesgo automático</p>
          {restaurant.riskLevel && (
            <Badge
              variant="outline"
              className={
                restaurant.riskLevel === "alto"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : restaurant.riskLevel === "medio"
                    ? "border-primary/40 bg-primary/10 text-terracota-400"
                    : "border-success/40 bg-success/10 text-success"
              }
            >
              {RISK_LEVEL_LABELS[restaurant.riskLevel]}
            </Badge>
          )}
        </div>
        {restaurant.riskSignals.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {restaurant.riskSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Sin señales de riesgo detectadas.</p>
        )}
      </div>

      {(restaurant.observationNote || restaurant.status === "observada" || restaurant.status === "rechazada") && (
        <div className="mt-6 rounded-xl border border-primary/40 bg-primary/10 p-4">
          <p className="text-sm font-medium text-terracota-400">Nota para el postulante</p>
          <p className="mt-1 text-sm text-foreground">{restaurant.observationNote}</p>
          {restaurant.observationDeadline && (
            <p className="mt-1 text-xs text-muted-foreground">
              Plazo para reenviar: {restaurant.observationDeadline.toISOString().slice(0, 10)}
            </p>
          )}
        </div>
      )}

      {restaurant.pausedReason && (
        <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">Motivo de pausa/suspensión</p>
          <p className="mt-1 text-sm text-foreground">{restaurant.pausedReason}</p>
        </div>
      )}

      {restaurant.trialEndsAt && restaurant.status === "aprobada" && (
        <p className="mt-6 text-sm text-muted-foreground">
          En período de prueba hasta el {restaurant.trialEndsAt.toISOString().slice(0, 10)} — máximo{" "}
          {restaurant.maxTrialReservations} reservas simultáneas.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-4">
        <p className="text-sm font-medium text-foreground">Licencia y certificado sanitario</p>
        <div className="mt-2 space-y-1 text-sm">
          {restaurant.municipalLicenseUrl ? (
            <p
              className={`flex items-center gap-1.5 ${
                restaurant.municipalLicenseExpiresAt && restaurant.municipalLicenseExpiresAt < today()
                  ? "text-destructive"
                  : "text-success"
              }`}
            >
              <FileCheck className="size-4 shrink-0" />
              Licencia {restaurant.municipalLicenseNumber} — vence {restaurant.municipalLicenseExpiresAt}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldAlert className="size-4 shrink-0" />
              Sin licencia municipal cargada.
            </p>
          )}
          {restaurant.healthCertificateUrl ? (
            <p
              className={`flex items-center gap-1.5 ${
                restaurant.healthCertificateExpiresAt && restaurant.healthCertificateExpiresAt < today()
                  ? "text-destructive"
                  : "text-success"
              }`}
            >
              <FileCheck className="size-4 shrink-0" />
              Certificado sanitario — vence {restaurant.healthCertificateExpiresAt}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldAlert className="size-4 shrink-0" />
              Sin certificado sanitario cargado.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-4">
        <p className="text-sm font-medium text-foreground">Representante</p>
        {restaurant.representativeName ? (
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-foreground">
              {restaurant.representativeName} · {restaurant.representativeRole} · Doc.{" "}
              {restaurant.representativeDocument}
            </p>
            <p className="text-muted-foreground">
              {restaurant.representativeEmail} · {restaurant.representativePhone}
            </p>
            {restaurant.representativeEmailVerifiedAt ? (
              <p className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="size-4 shrink-0" />
                Correo verificado
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-terracota-400">
                <ShieldAlert className="size-4 shrink-0" />
                Correo sin verificar
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldAlert className="size-4 shrink-0" />
            Sin datos de representante registrados.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-4">
        <p className="text-sm font-medium text-foreground">Verificación presencial</p>
        {restaurant.presencialVisitAt ? (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-success">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>
              Visitado el {restaurant.presencialVisitAt.toISOString().slice(0, 10)} por{" "}
              {restaurant.presencialVisitByAdmin?.name ?? restaurant.presencialVisitByAdmin?.email}
              {restaurant.presencialVisitNote && `: ${restaurant.presencialVisitNote}`}
            </span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Sin visita presencial registrada.</p>
        )}
        <div className="mt-3">
          <PresencialVisitForm restaurantId={restaurant.id} />
        </div>
      </div>

      <div className="mt-8">
        <ModerationActions
          restaurant={{
            id: restaurant.id,
            status: restaurant.status,
            reviewerId: restaurant.reviewerId,
            reviewerName: restaurant.reviewer?.name ?? restaurant.reviewer?.email ?? null,
            riskLevel: restaurant.riskLevel,
            firstApproverId: restaurant.firstApproverId,
            firstApproverName: restaurant.firstApprover?.name ?? restaurant.firstApprover?.email ?? null,
          }}
          currentUserId={session.user.id}
        />
      </div>
    </main>
  );
}
