"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { payReservationFeeAction } from "@/actions/reservations/pay-reservation-fee";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

export function StepPayment({
  code,
  restaurantName,
  date,
  timeSlot,
  guests,
  serviceFee,
  expiresAt,
}: {
  code: string;
  restaurantName: string;
  date: string;
  timeSlot: string;
  guests: number;
  serviceFee: number;
  expiresAt: string;
}) {
  const router = useRouter();
  const { label, isExpired, totalSeconds } = useCountdown(expiresAt);

  const { execute, isExecuting } = useAction(payReservationFeeAction, {
    onSuccess({ data }) {
      toast.success("¡Pago confirmado! Tu mesa está reservada.");
      router.push(`/dashboard/reservas/${data?.code}`);
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo procesar el pago.");
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Resumen de tu reserva</p>
        <p className="mt-1 font-display text-lg font-semibold text-foreground">
          {restaurantName}
        </p>
        <p className="text-sm text-muted-foreground">
          {date} · {timeSlot} · {guests} {guests === 1 ? "persona" : "personas"}
        </p>
        <p className="mt-3 text-2xl font-bold text-foreground">S/ {serviceFee.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">Tarifa de servicio LlamaEats</p>
      </div>

      <motion.div
        animate={totalSeconds > 0 && totalSeconds < 120 ? { scale: [1, 1.03, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.2 }}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium",
          isExpired
            ? "border-destructive/40 bg-destructive/10 text-destructive"
            : totalSeconds < 120
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-muted-foreground",
        )}
      >
        <Clock className="size-4" />
        {isExpired ? "El tiempo para pagar expiró" : `Tiempo restante: ${label}`}
      </motion.div>

      <Button
        size="lg"
        disabled={isExpired || isExecuting}
        onClick={() => execute({ code })}
      >
        {isExecuting ? "Procesando pago..." : `Pagar S/ ${serviceFee.toFixed(2)}`}
      </Button>

      {isExpired && (
        <p className="text-center text-sm text-muted-foreground">
          Tu reserva expiró. Vuelve a intentarlo desde la ficha del restaurante.
        </p>
      )}
    </div>
  );
}
