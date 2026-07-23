import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RESTAURANT_CATEGORIES, RESTAURANT_STATUS_LABELS, RISK_LEVEL_LABELS } from "@/lib/constants";

export type RestaurantModerationItem = {
  id: string;
  name: string;
  district: string;
  category: string;
  status: string;
  ruc: string | null;
  rucVerifiedAt: Date | null;
  riskLevel: string | null;
  owner: { name: string | null; email: string } | null;
};

const STATUS_VARIANT: Record<string, string> = {
  enviada: "border-primary/40 bg-primary/10 text-terracota-400",
  en_revision: "border-primary/40 bg-primary/10 text-terracota-400",
  observada: "border-primary/40 bg-primary/10 text-terracota-400",
  aprobada: "border-success/40 bg-success/10 text-success",
  activa: "border-success/40 bg-success/10 text-success",
  pausada: "border-border text-muted-foreground",
  suspendida: "border-destructive/40 bg-destructive/10 text-destructive",
  rechazada: "border-destructive/40 bg-destructive/10 text-destructive",
  caducada: "border-destructive/40 bg-destructive/10 text-destructive",
  dada_de_baja: "border-border text-muted-foreground",
};

const RISK_VARIANT: Record<string, string> = {
  bajo: "border-success/40 bg-success/10 text-success",
  medio: "border-primary/40 bg-primary/10 text-terracota-400",
  alto: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function RestaurantApprovalCard({ restaurant }: { restaurant: RestaurantModerationItem }) {
  const categoryLabel =
    RESTAURANT_CATEGORIES.find((c) => c.value === restaurant.category)?.label ??
    restaurant.category;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4">
      <div>
        <p className="font-display font-semibold text-foreground">{restaurant.name}</p>
        <p className="text-xs text-muted-foreground">
          {categoryLabel} · {restaurant.district} · {restaurant.owner?.name ?? restaurant.owner?.email}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          {restaurant.rucVerifiedAt ? (
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="size-3.5" />
              RUC verificado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <ShieldAlert className="size-3.5" />
              {restaurant.ruc ? "RUC sin verificar" : "Sin RUC"}
            </span>
          )}
          {restaurant.riskLevel && (
            <Badge variant="outline" className={RISK_VARIANT[restaurant.riskLevel]}>
              {RISK_LEVEL_LABELS[restaurant.riskLevel]}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={STATUS_VARIANT[restaurant.status]}>
          {RESTAURANT_STATUS_LABELS[restaurant.status] ?? restaurant.status}
        </Badge>
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/restaurantes/${restaurant.id}`}>Revisar</Link>
        </Button>
      </div>
    </div>
  );
}
