"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Pause, Play, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deactivateByOwnerAction,
  pauseByOwnerAction,
  resumeByOwnerAction,
} from "@/actions/restaurants/lifecycle";

export function LifecycleActions({ restaurantId, status }: { restaurantId: string; status: string }) {
  const router = useRouter();
  const onSuccess = (message: string) => () => {
    toast.success(message);
    router.refresh();
  };
  const onError = ({ error }: { error: { serverError?: string } }) => {
    toast.error(error.serverError ?? "No se pudo completar la acción.");
  };

  const pause = useAction(pauseByOwnerAction, { onSuccess: onSuccess("Restaurante pausado."), onError });
  const resume = useAction(resumeByOwnerAction, { onSuccess: onSuccess("Restaurante reactivado."), onError });
  const deactivate = useAction(deactivateByOwnerAction, {
    onSuccess: onSuccess("Restaurante dado de baja."),
    onError,
  });

  if (status === "pausada") {
    return (
      <Button
        variant="outline"
        className="gap-2"
        disabled={resume.isExecuting}
        onClick={() => resume.execute({ restaurantId })}
      >
        <Play className="size-4" />
        {resume.isExecuting ? "Reactivando..." : "Reanudar"}
      </Button>
    );
  }

  if (["aprobada", "activa"].includes(status)) {
    return (
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="gap-2"
          disabled={pause.isExecuting}
          onClick={() => pause.execute({ restaurantId })}
        >
          <Pause className="size-4" />
          {pause.isExecuting ? "Pausando..." : "Pausar (cerrar hoy)"}
        </Button>
        <Button
          variant="outline"
          className="gap-2 text-destructive"
          disabled={deactivate.isExecuting}
          onClick={() => {
            if (confirm("¿Dar de baja tu restaurante de forma permanente? Podrás volver a afiliarte más adelante contactando a soporte.")) {
              deactivate.execute({ restaurantId });
            }
          }}
        >
          <PowerOff className="size-4" />
          Dar de baja
        </Button>
      </div>
    );
  }

  return null;
}
