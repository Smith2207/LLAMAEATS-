"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { DoorClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createScheduleExceptionAction } from "@/actions/restaurants/schedule-exceptions";

// Bloqueo rápido (§7): cierra el local para el resto del día de hoy sin
// tener que ir al perfil a crear la excepción a mano. Reusa el mismo
// mecanismo de excepciones de calendario — un "cerrado" para la fecha de
// hoy simplemente deja de aceptar reservas nuevas ese día.
export function QuickCloseToday({ today }: { today: string }) {
  const router = useRouter();

  const { execute, isExecuting } = useAction(createScheduleExceptionAction, {
    onSuccess() {
      toast.success("Local cerrado por hoy — no se aceptarán más reservas para hoy.");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo cerrar el local.");
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2 text-destructive"
      disabled={isExecuting}
      onClick={() => {
        if (confirm("¿Cerrar el local por el resto de hoy? No se aceptarán reservas nuevas para hoy.")) {
          execute({ date: today, type: "cerrado", note: "Cierre rápido" });
        }
      }}
    >
      <DoorClosed className="size-4" />
      {isExecuting ? "Cerrando..." : "Cerrar hoy"}
    </Button>
  );
}
