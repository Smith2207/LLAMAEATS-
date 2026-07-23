"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveRestaurantAction, rejectRestaurantAction } from "@/actions/restaurants/moderate-restaurant";

export function ModerationActions({ restaurantId, status }: { restaurantId: string; status: string }) {
  const router = useRouter();

  const { execute: approve, isExecuting: approving } = useAction(approveRestaurantAction, {
    onSuccess() {
      toast.success("Restaurante aprobado.");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo aprobar.");
    },
  });

  const { execute: reject, isExecuting: rejecting } = useAction(rejectRestaurantAction, {
    onSuccess() {
      toast.success("Restaurante rechazado.");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo rechazar.");
    },
  });

  if (status === "aprobado") {
    return (
      <Button variant="outline" className="gap-2" disabled={rejecting} onClick={() => reject({ restaurantId })}>
        <X className="size-4" />
        Rechazar
      </Button>
    );
  }

  return (
    <div className="flex gap-3">
      <Button className="gap-2" disabled={approving} onClick={() => approve({ restaurantId })}>
        <Check className="size-4" />
        {approving ? "Aprobando..." : "Aprobar"}
      </Button>
      <Button
        variant="outline"
        className="gap-2"
        disabled={rejecting}
        onClick={() => reject({ restaurantId })}
      >
        <X className="size-4" />
        Rechazar
      </Button>
    </div>
  );
}
