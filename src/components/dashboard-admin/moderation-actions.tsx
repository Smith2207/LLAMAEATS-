"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Check, Inbox, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  approveApplicationAction,
  claimReviewAction,
  observeApplicationAction,
  rejectApplicationAction,
} from "@/actions/restaurants/review-application";
import { reactivateRestaurantAction, suspendRestaurantAction } from "@/actions/restaurants/lifecycle";

type Restaurant = {
  id: string;
  status: string;
  reviewerId: string | null;
  reviewerName: string | null;
  riskLevel: string | null;
  firstApproverId: string | null;
  firstApproverName: string | null;
};

export function ModerationActions({
  restaurant,
  currentUserId,
}: {
  restaurant: Restaurant;
  currentUserId: string;
}) {
  const router = useRouter();
  const [observeOpen, setObserveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");

  const onSuccess = (message: string) => () => {
    toast.success(message);
    router.refresh();
  };
  const onError = ({ error }: { error: { serverError?: string } }) => {
    toast.error(error.serverError ?? "No se pudo completar la acción.");
  };

  const claim = useAction(claimReviewAction, { onSuccess: onSuccess("Expediente asignado a ti."), onError });
  const approve = useAction(approveApplicationAction, {
    onSuccess({ data }) {
      if (data?.needsSecondApprover && !data.confirmed) {
        toast.success("Propuesta de aprobación registrada. Otro administrador debe confirmarla.");
      } else {
        toast.success("Restaurante aprobado — inicia su período de prueba de 30 días.");
      }
      router.refresh();
    },
    onError,
  });
  const observe = useAction(observeApplicationAction, {
    onSuccess() {
      toast.success("Observación enviada al postulante.");
      setObserveOpen(false);
      setNote("");
      router.refresh();
    },
    onError,
  });
  const reject = useAction(rejectApplicationAction, {
    onSuccess() {
      toast.success("Restaurante rechazado.");
      setRejectOpen(false);
      setNote("");
      router.refresh();
    },
    onError,
  });
  const suspend = useAction(suspendRestaurantAction, {
    onSuccess: onSuccess("Restaurante suspendido."),
    onError,
  });
  const reactivate = useAction(reactivateRestaurantAction, {
    onSuccess: onSuccess("Restaurante reactivado."),
    onError,
  });

  if (restaurant.status === "enviada") {
    return (
      <Button
        className="gap-2"
        disabled={claim.isExecuting}
        onClick={() => claim.execute({ restaurantId: restaurant.id })}
      >
        <Inbox className="size-4" />
        {claim.isExecuting ? "Asignando..." : "Reclamar expediente"}
      </Button>
    );
  }

  if (restaurant.status === "en_revision") {
    if (restaurant.reviewerId !== currentUserId) {
      return (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4" />
          En revisión por {restaurant.reviewerName ?? "otro administrador"}.
        </p>
      );
    }

    const pendingSecondApproval = restaurant.firstApproverId && restaurant.riskLevel !== "bajo";

    return (
      <div className="flex flex-col gap-3">
        {pendingSecondApproval && (
          <p className="text-sm text-terracota-400">
            {restaurant.firstApproverId === currentUserId
              ? "Ya propusiste aprobar este expediente — otro administrador debe confirmar."
              : `${restaurant.firstApproverName ?? "Otro administrador"} propuso aprobar este expediente de riesgo ${restaurant.riskLevel}. Confirma o rechaza.`}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button
            className="gap-2"
            disabled={approve.isExecuting || Boolean(restaurant.firstApproverId === currentUserId)}
            onClick={() => approve.execute({ restaurantId: restaurant.id })}
          >
            <Check className="size-4" />
            {approve.isExecuting ? "Procesando..." : pendingSecondApproval ? "Confirmar aprobación" : "Aprobar"}
          </Button>

          <Dialog open={observeOpen} onOpenChange={setObserveOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Observar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Observar solicitud</DialogTitle>
              </DialogHeader>
              <Field>
                <FieldLabel htmlFor="observe-note">Qué debe corregir el postulante</FieldLabel>
                <Textarea id="observe-note" value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
              </Field>
              <DialogFooter>
                <Button
                  disabled={observe.isExecuting}
                  onClick={() => observe.execute({ restaurantId: restaurant.id, note, deadlineDays: 7 })}
                >
                  {observe.isExecuting ? "Enviando..." : "Enviar observación (plazo 7 días)"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive">
                <X className="size-4" />
                Rechazar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rechazar solicitud</DialogTitle>
              </DialogHeader>
              <Field>
                <FieldLabel htmlFor="reject-note">Motivo del rechazo</FieldLabel>
                <Textarea id="reject-note" value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
              </Field>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="text-destructive"
                  disabled={reject.isExecuting}
                  onClick={() => reject.execute({ restaurantId: restaurant.id, note })}
                >
                  {reject.isExecuting ? "Rechazando..." : "Confirmar rechazo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (["aprobada", "activa", "pausada"].includes(restaurant.status)) {
    return (
      <Button
        variant="outline"
        className="gap-2 text-destructive"
        disabled={suspend.isExecuting}
        onClick={() => suspend.execute({ restaurantId: restaurant.id })}
      >
        <X className="size-4" />
        {suspend.isExecuting ? "Suspendiendo..." : "Suspender"}
      </Button>
    );
  }

  if (restaurant.status === "suspendida") {
    return (
      <Button
        className="gap-2"
        disabled={reactivate.isExecuting}
        onClick={() => reactivate.execute({ restaurantId: restaurant.id })}
      >
        <Check className="size-4" />
        {reactivate.isExecuting ? "Reactivando..." : "Reactivar"}
      </Button>
    );
  }

  return null;
}
