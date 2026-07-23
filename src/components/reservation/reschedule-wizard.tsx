"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { StepDateTimeGuests } from "./step-date-time-guests";
import { StepTableMap } from "./step-table-map";
import { rescheduleReservationAction } from "@/actions/reservations/reschedule-reservation";

export function RescheduleWizard({
  code,
  restaurantId,
  guests,
}: {
  code: string;
  restaurantId: string;
  guests: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  const { execute, isExecuting } = useAction(rescheduleReservationAction, {
    onSuccess({ data }) {
      toast.success("Reserva reprogramada.");
      router.push(`/dashboard/reservas/${data?.code}`);
    },
    onError({ error }) {
      if (error.serverError === "TABLE_ALREADY_BOOKED") {
        toast.error("Esa mesa ya se ocupó para ese horario. Elige otra.");
        return;
      }
      toast.error(error.serverError ?? "No se pudo reprogramar la reserva.");
    },
  });

  if (step === 1) {
    return (
      <StepDateTimeGuests
        restaurantId={restaurantId}
        fixedGuests={guests}
        onNext={(values) => {
          setDate(values.date);
          setTimeSlot(values.timeSlot);
          setStep(2);
        }}
      />
    );
  }

  return (
    <StepTableMap
      restaurantId={restaurantId}
      date={date}
      timeSlot={timeSlot}
      guests={guests}
      onBack={() => setStep(1)}
      onNext={(tableId) => {
        if (isExecuting) return;
        execute({ code, tableId, date, timeSlot });
      }}
    />
  );
}
