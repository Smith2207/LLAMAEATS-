import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RESTAURANT_CATEGORIES, RESTAURANT_STATUS_LABELS } from "@/lib/constants";

export type RestaurantModerationItem = {
  id: string;
  name: string;
  district: string;
  category: string;
  status: string;
  ruc: string | null;
  rucVerifiedAt: Date | null;
  owner: { name: string | null; email: string } | null;
};

const STATUS_VARIANT: Record<string, string> = {
  pendiente: "border-primary/40 bg-primary/10 text-primary",
  aprobado: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  rechazado: "border-destructive/40 bg-destructive/10 text-destructive",
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
        <p className="mt-1 flex items-center gap-1 text-xs">
          {restaurant.rucVerifiedAt ? (
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 className="size-3.5" />
              RUC verificado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <ShieldAlert className="size-3.5" />
              {restaurant.ruc ? "RUC sin verificar" : "Sin RUC"}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={STATUS_VARIANT[restaurant.status]}>
          {RESTAURANT_STATUS_LABELS[restaurant.status]}
        </Badge>
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/restaurantes/${restaurant.id}`}>Revisar</Link>
        </Button>
      </div>
    </div>
  );
}
