"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAvailableTablesAction } from "@/actions/reservations/get-availability";
import { cn } from "@/lib/utils";

type TableItem = {
  id: string;
  number: number;
  seats: number;
  zone: string;
};

export function StepTableMap({
  restaurantId,
  date,
  timeSlot,
  guests,
  onNext,
  onBack,
}: {
  restaurantId: string;
  date: string;
  timeSlot: string;
  guests: number;
  onNext: (tableId: string) => void;
  onBack: () => void;
}) {
  const [tables, setTables] = useState<TableItem[] | null>(null);
  const [zone, setZone] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const { execute, isExecuting } = useAction(getAvailableTablesAction, {
    onSuccess({ data }) {
      setTables(data?.tables ?? []);
      const zones = Array.from(new Set((data?.tables ?? []).map((t) => t.zone)));
      setZone(zones[0] ?? null);
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo consultar las mesas disponibles.");
    },
  });

  useEffect(() => {
    execute({ restaurantId, date, timeSlot, guests });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, date, timeSlot, guests]);

  const zones = useMemo(
    () => Array.from(new Set((tables ?? []).map((t) => t.zone))),
    [tables],
  );
  const visibleTables = useMemo(
    () => (tables ?? []).filter((t) => !zone || t.zone === zone),
    [tables, zone],
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {date} · {timeSlot} · {guests} {guests === 1 ? "persona" : "personas"}
      </p>

      {isExecuting && <p className="text-sm text-muted-foreground">Buscando mesas...</p>}

      {tables && tables.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No quedan mesas libres para ese horario. Vuelve atrás y elige otro.
        </p>
      )}

      {zones.length > 1 && (
        <Tabs value={zone ?? zones[0]} onValueChange={setZone}>
          <TabsList>
            {zones.map((z) => (
              <TabsTrigger key={z} value={z}>
                {z}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visibleTables.map((table) => (
          <motion.button
            key={table.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelected(table.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border p-4 transition-colors",
              selected === table.id
                ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary)]"
                : "border-border hover:border-primary/50",
            )}
          >
            <span className="font-display text-lg font-semibold text-foreground">
              Mesa {table.number}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              {table.seats} asientos
            </span>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button disabled={!selected} onClick={() => selected && onNext(selected)}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
