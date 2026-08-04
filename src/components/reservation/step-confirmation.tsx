"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StepConfirmation({
  code,
  restaurantName,
  date,
  timeSlot,
  guests,
}: {
  code: string;
  restaurantName: string;
  date: string;
  timeSlot: string;
  guests: number;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <CheckCircle2 className="size-14 text-success" />
      </motion.div>

      <div className="w-full rounded-xl border border-border bg-card p-5 text-left">
        <p className="text-sm text-muted-foreground">Tu mesa está confirmada</p>
        <p className="mt-1 font-display text-lg font-semibold text-foreground">
          {restaurantName}
        </p>
        <p className="text-sm text-muted-foreground">
          {date} · {timeSlot} · {guests} {guests === 1 ? "persona" : "personas"}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Código de reserva: {code}</p>
      </div>

      <Button size="lg" onClick={() => router.push(`/dashboard/reservas/${code}`)}>
        Ver mi reserva
      </Button>
    </div>
  );
}
