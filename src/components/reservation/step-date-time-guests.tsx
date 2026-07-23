"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { getAvailableSlotsAction } from "@/actions/reservations/get-availability";
import { cn } from "@/lib/utils";

export function StepDateTimeGuests({
  restaurantId,
  fixedGuests,
  onNext,
}: {
  restaurantId: string;
  /** Si se define, el número de personas queda fijo (usado al reprogramar). */
  fixedGuests?: number;
  onNext: (values: { date: string; guests: number; timeSlot: string }) => void;
}) {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(fixedGuests ?? 2);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);

  const { execute, isExecuting } = useAction(getAvailableSlotsAction, {
    onSuccess({ data }) {
      setSlots(data?.slots ?? []);
      setTimeSlot(null);
      if (!data?.slots?.length) {
        toast.info("No hay horarios disponibles para esa fecha y número de personas.");
      }
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo consultar disponibilidad.");
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="date">Fecha</FieldLabel>
          <Input
            id="date"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSlots(null);
            }}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="guests">Número de personas</FieldLabel>
          <Input
            id="guests"
            type="number"
            min={1}
            max={20}
            value={guests}
            disabled={fixedGuests !== undefined}
            onChange={(e) => {
              setGuests(Number(e.target.value));
              setSlots(null);
            }}
          />
        </Field>
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={!date || guests < 1 || isExecuting}
        onClick={() => execute({ restaurantId, date, guests })}
      >
        {isExecuting ? "Consultando..." : "Ver horarios disponibles"}
      </Button>

      {slots && slots.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Horarios disponibles</p>
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <motion.button
                key={slot}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeSlot(slot)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  timeSlot === slot
                    ? "border-primary bg-primary/10 text-terracota-400"
                    : "border-border text-foreground hover:border-primary/50",
                )}
              >
                {slot}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <Button
        size="lg"
        disabled={!timeSlot}
        onClick={() => timeSlot && onNext({ date, guests, timeSlot })}
      >
        Continuar
      </Button>
    </div>
  );
}
