"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { StepperNav } from "./stepper-nav";
import { StepDateTimeGuests } from "./step-date-time-guests";
import { StepTableMap } from "./step-table-map";
import { StepPayment } from "./step-payment";
import { createReservationAction } from "@/actions/reservations/create-reservation";

type WizardState = {
  date: string;
  guests: number;
  timeSlot: string;
  tableId: string | null;
  code: string | null;
  serviceFee: number | null;
  expiresAt: string | null;
};

export function ReservationWizard({
  restaurantId,
  restaurantName,
}: {
  restaurantId: string;
  restaurantName: string;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<WizardState>({
    date: "",
    guests: 2,
    timeSlot: "",
    tableId: null,
    code: null,
    serviceFee: null,
    expiresAt: null,
  });

  const { execute: createReservation, isExecuting } = useAction(createReservationAction, {
    onSuccess({ data }) {
      if (!data) return;
      setState((s) => ({ ...s, code: data.code, serviceFee: data.serviceFee, expiresAt: data.expiresAt }));
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

            {step === 3 && state.code && state.serviceFee !== null && state.expiresAt && (
              <StepPayment
                code={state.code}
                restaurantName={restaurantName}
                date={state.date}
                timeSlot={state.timeSlot}
                guests={state.guests}
                serviceFee={state.serviceFee}
                expiresAt={state.expiresAt}
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
