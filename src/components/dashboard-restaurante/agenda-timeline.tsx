"use client";

import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { motion, type PanInfo } from "framer-motion";
import { toast } from "sonner";
import { staffRescheduleReservationAction } from "@/actions/reservations/staff-reschedule-reservation";
import { generateTimeSlots, timeToMinutes } from "@/lib/reservations/time";
import { RESERVATION_BLOCK_MINUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PX_PER_MINUTE = 2.2;
const ROW_HEIGHT = 56;

export type TimelineTable = { id: string; number: number; zone: string; seats: number };
export type TimelineReservation = {
  code: string;
  tableId: string;
  timeSlot: string;
  guests: number;
  status: string;
  user: { name: string | null };
};

const STATUS_BLOCK_STYLE: Record<string, string> = {
  pendiente_pago: "border-primary/50 bg-primary/15",
  confirmada: "border-success/50 bg-success/15",
  en_curso: "border-success bg-success/30",
};

export function AgendaTimeline({
  tables,
  reservations,
  openTime,
  closeTime,
  turnoverBufferMinutes,
}: {
  tables: TimelineTable[];
  reservations: TimelineReservation[];
  openTime: string;
  closeTime: string;
  turnoverBufferMinutes: number;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);
  const totalMinutes = closeMinutes - openMinutes;
  const timelineWidth = totalMinutes * PX_PER_MINUTE;

  const slots = useMemo(() => generateTimeSlots(openTime, closeTime), [openTime, closeTime]);
  const hourMarks = useMemo(() => {
    const marks: number[] = [];
    for (let m = Math.ceil(openMinutes / 60) * 60; m <= closeMinutes; m += 60) marks.push(m);
    return marks;
  }, [openMinutes, closeMinutes]);

  const zones = useMemo(() => Array.from(new Set(tables.map((t) => t.zone))), [tables]);

  const reservationsByTable = useMemo(() => {
    const map = new Map<string, TimelineReservation[]>();
    for (const r of reservations) {
      if (!map.has(r.tableId)) map.set(r.tableId, []);
      map.get(r.tableId)!.push(r);
    }
    return map;
  }, [reservations]);

  const { execute, isExecuting } = useAction(staffRescheduleReservationAction, {
    onSuccess() {
      toast.success("Reserva movida.");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo mover la reserva.");
    },
  });

  function nearestSlot(targetMinutes: number): string {
    return slots.reduce((best, s) =>
      Math.abs(timeToMinutes(s) - targetMinutes) < Math.abs(timeToMinutes(best) - targetMinutes) ? s : best,
    );
  }

  function handleDragEnd(reservation: TimelineReservation, info: PanInfo) {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const xInContainer = info.point.x - containerRect.left + container.scrollLeft;
    const targetSlot = nearestSlot(openMinutes + xInContainer / PX_PER_MINUTE);

    let targetTableId = reservation.tableId;
    for (const [tableId, el] of rowRefs.current) {
      const r = el.getBoundingClientRect();
      if (info.point.y >= r.top && info.point.y <= r.bottom) {
        targetTableId = tableId;
        break;
      }
    }

    if (targetTableId === reservation.tableId && targetSlot === reservation.timeSlot) return;
    if (isExecuting) return;
    execute({ code: reservation.code, tableId: targetTableId, timeSlot: targetSlot });
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <p className="border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
        Arrastra una reserva para cambiarla de mesa o de horario. Se confirma la disponibilidad real
        al soltar.
      </p>
      <div className="flex overflow-x-auto">
        {/* Columna fija de mesas */}
        <div className="sticky left-0 z-10 shrink-0 border-r border-border/60 bg-card">
          <div style={{ height: 32 }} />
          {zones.map((zone) => (
            <div key={zone}>
              <div
                className="flex items-center bg-secondary/40 px-3 text-xs font-medium text-muted-foreground"
                style={{ height: 24 }}
              >
                {zone}
              </div>
              {tables
                .filter((t) => t.zone === zone)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center border-t border-border/40 px-3 text-sm text-foreground"
                    style={{ height: ROW_HEIGHT }}
                  >
                    Mesa {t.number} <span className="ml-1 text-xs text-muted-foreground">({t.seats})</span>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Línea de tiempo */}
        <div ref={containerRef} className="relative" style={{ width: timelineWidth }}>
          <div className="relative border-b border-border/60" style={{ height: 32 }}>
            {hourMarks.map((m) => (
              <div
                key={m}
                className="absolute top-0 h-full border-l border-border/40 pl-1 text-xs text-muted-foreground"
                style={{ left: (m - openMinutes) * PX_PER_MINUTE }}
              >
                {Math.floor(m / 60)
                  .toString()
                  .padStart(2, "0")}
                :00
              </div>
            ))}
          </div>

          {zones.map((zone) => (
            <div key={zone}>
              <div className="bg-secondary/40" style={{ height: 24 }} />
              {tables
                .filter((t) => t.zone === zone)
                .map((table) => (
                  <div
                    key={table.id}
                    ref={(el) => {
                      if (el) rowRefs.current.set(table.id, el);
                    }}
                    className="relative border-t border-border/40"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {hourMarks.map((m) => (
                      <div
                        key={m}
                        className="absolute top-0 h-full border-l border-border/20"
                        style={{ left: (m - openMinutes) * PX_PER_MINUTE }}
                      />
                    ))}

                    {(reservationsByTable.get(table.id) ?? []).map((r) => {
                      const start = timeToMinutes(r.timeSlot);
                      const left = (start - openMinutes) * PX_PER_MINUTE;
                      const blockWidth = RESERVATION_BLOCK_MINUTES * PX_PER_MINUTE;
                      const bufferWidth = turnoverBufferMinutes * PX_PER_MINUTE;

                      return (
                        <motion.div
                          key={r.code}
                          drag
                          dragSnapToOrigin
                          dragMomentum={false}
                          whileDrag={{ zIndex: 20, boxShadow: "0 8px 20px rgba(0,0,0,0.25)" }}
                          onDragEnd={(_, info) => handleDragEnd(r, info)}
                          className={cn(
                            "absolute top-1.5 flex cursor-grab flex-col justify-center rounded-md border px-2 py-1 text-xs active:cursor-grabbing",
                            STATUS_BLOCK_STYLE[r.status] ?? "border-border bg-muted",
                          )}
                          style={{ left, width: blockWidth, height: ROW_HEIGHT - 12 }}
                        >
                          <span className="truncate font-medium text-foreground">
                            {r.user.name ?? "Cliente"}
                          </span>
                          <span className="truncate text-muted-foreground">
                            {r.timeSlot.slice(0, 5)} · {r.guests}p
                          </span>
                          <span
                            className="pointer-events-none absolute inset-y-0 border-l border-dashed border-border/60 bg-muted/30"
                            style={{ left: blockWidth, width: bufferWidth }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
