"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { settleRestaurantCommissionsAction } from "@/actions/commissions/settle-restaurant-commissions";

export function CommissionBalance({
  restaurantId,
  pendiente,
  liquidado,
}: {
  restaurantId: string;
  pendiente: number;
  liquidado: number;
}) {
  const router = useRouter();

  const { execute, isExecuting } = useAction(settleRestaurantCommissionsAction, {
    onSuccess() {
      toast.success("Comisión marcada como liquidada.");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo liquidar la comisión.");
    },
  });

  return (
    <div className="mt-6 rounded-xl border border-border/60 bg-card p-4">
      <p className="text-sm font-medium text-foreground">Comisión con LlamaEats</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <p className="text-foreground">
            S/ {pendiente.toFixed(2)} <span className="text-muted-foreground">pendiente</span>
          </p>
          <p className="text-muted-foreground">S/ {liquidado.toFixed(2)} ya liquidado</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={pendiente === 0 || isExecuting}
          onClick={() => execute({ restaurantId })}
        >
          {isExecuting ? "Marcando..." : "Marcar como liquidado"}
        </Button>
      </div>
    </div>
  );
}
