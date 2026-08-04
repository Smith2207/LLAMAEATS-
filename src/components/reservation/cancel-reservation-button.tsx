"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cancelReservationAction } from "@/actions/reservations/cancel-reservation";
import { useState } from "react";

export function CancelReservationButton({ code }: { code: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { execute, isExecuting } = useAction(cancelReservationAction, {
    onSuccess() {
      toast.success("Reserva cancelada.");
      setOpen(false);
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo cancelar la reserva.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Cancelar reserva</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cancelar esta reserva?</DialogTitle>
          <DialogDescription>
            Puedes cancelar sin costo en cualquier momento antes de la hora reservada.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Volver
          </Button>
          <Button variant="destructive" disabled={isExecuting} onClick={() => execute({ code })}>
            {isExecuting ? "Cancelando..." : "Sí, cancelar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
