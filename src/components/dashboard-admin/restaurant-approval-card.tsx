import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RESTAURANT_CATEGORIES, RESTAURANT_STATUS_LABELS } from "@/lib/constants";

export type RestaurantModerationItem = {
  id: string;
  name: string;
  district: string;
  category: string;
  status: string;
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
