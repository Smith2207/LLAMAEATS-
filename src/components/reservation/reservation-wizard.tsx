"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { StepperNav } from "./stepper-nav";
import { StepDateTimeGuests } from "./step-date-time-guests";
import { StepTableMap } from "./step-table-map";
import { StepConfirmation } from "./step-confirmation";
import { createReservationAction } from "@/actions/reservations/create-reservation";

type WizardState = {
  date: string;
  guests: number;
  timeSlot: string;
  tableId: string | null;
  code: string | null;
};

export function ReservationWizard({
  restaurantId,
  restaurantName,
  initialDate,
  initialTimeSlot,
  initialGuests,
}: {
  restaurantId: string;
  restaurantName: string;
  initialDate?: string;
  initialTimeSlot?: string;
  initialGuests?: number;
}) {
  // Si llega desde el email de "se liberó un cupo" (lista de espera), ya
  // tenemos fecha/hora/personas — saltamos directo a elegir mesa en vez de
  // hacerlo repetir el paso 1, porque ahí es una carrera contra otros de la
  // lista.
  const hasPrefill = Boolean(initialDate && initialTimeSlot && initialGuests);
  const [step, setStep] = useState<1 | 2 | 3>(hasPrefill ? 2 : 1);
  const [state, setState] = useState<WizardState>({
    date: initialDate ?? "",
    guests: initialGuests ?? 2,
    timeSlot: initialTimeSlot ?? "",
    tableId: null,
    code: null,
  });

  const { execute: createReservation, isExecuting } = useAction(createReservationAction, {
    onSuccess({ data }) {
      if (!data) return;
      setState((s) => ({ ...s, code: data.code }));
      setStep(3);
    },
    onError({ error }) {
      if (error.serverError === "TABLE_ALREADY_BOOKED") {
        toast.error("Justo se ocupó esa mesa. Elige otra.");
        setState((s) => ({ ...s, tableId: null }));
        return;
      }
      toast.error(error.serverError ?? "No se pudo crear la reserva.");
    },
  });

  return (
    <div className="glass rounded-2xl p-6">
      <StepperNav step={step} />

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <StepDateTimeGuests
                restaurantId={restaurantId}
                onNext={({ date, guests, timeSlot }) => {
                  setState((s) => ({ ...s, date, guests, timeSlot }));
                  setStep(2);
                }}
              />
            )}

            {step === 2 && (
              <StepTableMap
                restaurantId={restaurantId}
                date={state.date}
                timeSlot={state.timeSlot}
                guests={state.guests}
                onBack={() => setStep(1)}
                onNext={(tableId) => {
                  setState((s) => ({ ...s, tableId }));
                  createReservation({
                    restaurantId,
                    tableId,
                    date: state.date,
                    timeSlot: state.timeSlot,
                    guests: state.guests,
                  });
                }}
              />
            )}

            {step === 3 && state.code && (
              <StepConfirmation
                code={state.code}
                restaurantName={restaurantName}
                date={state.date}
                timeSlot={state.timeSlot}
                guests={state.guests}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {isExecuting && step === 2 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">Reservando tu mesa...</p>
      )}
    </div>
  );
}
