"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markAttendanceAction } from "@/actions/attendance/mark-attendance";
import { RESERVATION_STATUS_LABELS } from "@/lib/constants";
import { usePolling } from "@/hooks/use-polling";

export type InboxReservation = {
  code: string;
  timeSlot: string;
  guests: number;
  status: string;
  table: { number: number; zone: string };
  user: { name: string | null; phone: string | null };
};

export function ReservationsInbox({ reservations }: { reservations: InboxReservation[] }) {
  usePolling(20000);
  const router = useRouter();

  const { execute, isExecuting } = useAction(markAttendanceAction, {
    onSuccess() {
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo actualizar.");
    },
  });

  if (reservations.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay reservas para este día.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {reservations.map((r) => (
        <div
          key={r.code}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-4 py-3"
        >
          <div>
            <p className="font-medium text-foreground">
              {r.timeSlot.slice(0, 5)} · {r.user.name ?? "Cliente"} ·{" "}
              <span className="text-muted-foreground">
                Mesa {r.table.number} ({r.table.zone})
              </span>
            </p>
            <p className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {r.guests}
              </span>
              {r.user.phone && <span>{r.user.phone}</span>}
            </p>
          </div>

          {r.status === "confirmada" ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isExecuting}
                className="gap-1"
                onClick={() => execute({ code: r.code, attended: true })}
              >
                <Check className="size-3.5" />
                Asistió
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isExecuting}
                className="gap-1 text-destructive"
                onClick={() => execute({ code: r.code, attended: false })}
              >
                <X className="size-3.5" />
                No asistió
              </Button>
            </div>
          ) : (
            <Badge variant="outline">{RESERVATION_STATUS_LABELS[r.status] ?? r.status}</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
