"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronDown, CloudOff, DoorOpen, History, RefreshCw, Users, WifiOff, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  markArrivalAction,
  markNoShowAction,
  releaseTableAction,
} from "@/actions/attendance/mark-attendance";
import {
  getCustomerHistoryAction,
  updateReservationStaffNotesAction,
} from "@/actions/reservations/customer-history";
import { RESERVATION_STATUS_LABELS } from "@/lib/constants";
import { usePolling } from "@/hooks/use-polling";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { cn } from "@/lib/utils";

export type InboxReservation = {
  code: string;
  tableId: string;
  timeSlot: string;
  guests: number;
  status: string;
  notes: string | null;
  staffNotes: string | null;
  table: { number: number; zone: string };
  user: { id: string; name: string | null; phone: string | null };
};

function CustomerFile({ reservation }: { reservation: InboxReservation }) {
  const router = useRouter();
  const [staffNotes, setStaffNotes] = useState(reservation.staffNotes ?? "");
  const [history, setHistory] = useState<{ completedVisits: number; noShows: number } | null>(null);

  const loadHistory = useAction(getCustomerHistoryAction, {
    onSuccess({ data }) {
      if (data) setHistory(data);
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo cargar el historial.");
    },
  });

  const saveNotes = useAction(updateReservationStaffNotesAction, {
    onSuccess() {
      toast.success("Nota guardada.");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo guardar la nota.");
    },
  });

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-border/60 pt-3 text-sm">
      {reservation.notes && (
        <p>
          <span className="font-medium text-foreground">Nota del comensal: </span>
          <span className="text-muted-foreground">{reservation.notes}</span>
        </p>
      )}

      {!history ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5"
          disabled={loadHistory.isExecuting}
          onClick={() => loadHistory.execute({ userId: reservation.user.id, reservationCode: reservation.code })}
        >
          <History className="size-3.5" />
          {loadHistory.isExecuting ? "Cargando..." : "Ver historial en este local"}
        </Button>
      ) : (
        <p className="text-muted-foreground">
          {history.completedVisits} visita{history.completedVisits === 1 ? "" : "s"} completada
          {history.completedVisits === 1 ? "" : "s"} · {history.noShows} no-show
          {history.noShows === 1 ? "" : "s"} en este local.
        </p>
      )}

      <div>
        <Textarea
          value={staffNotes}
          onChange={(e) => setStaffNotes(e.target.value)}
          placeholder="Notas internas (solo visibles para el local): preferencias, alergias, ocasión especial..."
          rows={2}
          className="text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-1.5"
          disabled={saveNotes.isExecuting || staffNotes === (reservation.staffNotes ?? "")}
          onClick={() => saveNotes.execute({ code: reservation.code, staffNotes })}
        >
          {saveNotes.isExecuting ? "Guardando..." : "Guardar nota"}
        </Button>
      </div>
    </div>
  );
}

export function ReservationsInbox({ reservations }: { reservations: InboxReservation[] }) {
  usePolling(20000);
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const onError = (event: { error: { serverError?: string } }) => {
    toast.error(event.error.serverError ?? "No se pudo actualizar.");
  };
  const onSuccess = () => router.refresh();

  const arrival = useAction(markArrivalAction, { onSuccess, onError });
  const release = useAction(releaseTableAction, { onSuccess, onError });
  const noShow = useAction(markNoShowAction, { onSuccess, onError });

  const { isOnline, queue, conflicts, isSyncing, queueAction, dismissConflict } = useOfflineSync(
    () => router.refresh(),
  );

  const isExecuting = arrival.isExecuting || release.isExecuting || noShow.isExecuting;
  const pendingCodes = new Set(queue.map((q) => q.code));

  const runOrQueue = async (
    type: "markArrival" | "markNoShow" | "releaseTable",
    code: string,
    label: string,
    execute: () => void,
  ) => {
    if (!isOnline) {
      await queueAction(type, code, label);
      toast.info(`"${label}" se sincronizará al reconectar.`);
      return;
    }
    execute();
  };

  if (reservations.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay reservas para este día.</p>;
  }

  return (
    <div className="flex flex-col gap-2 print:gap-1">
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning print:hidden">
          <WifiOff className="size-4 shrink-0" />
          Sin conexión. La agenda muestra el último estado guardado
          {queue.length > 0 && ` — ${queue.length} acción${queue.length === 1 ? "" : "es"} en espera`}.
        </div>
      )}

      {isOnline && isSyncing && (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground print:hidden">
          <RefreshCw className="size-4 shrink-0 animate-spin" />
          Sincronizando acciones pendientes...
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm print:hidden">
          <p className="flex items-center gap-1.5 font-medium text-destructive">
            <CloudOff className="size-4" />
            Conflictos de sincronización
          </p>
          {conflicts.map((c) => (
            <div key={c.action.id} className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>
                {c.action.label} ({c.action.code}): {c.error}
              </span>
              <Button size="sm" variant="ghost" onClick={() => dismissConflict(c.action.id)}>
                Descartar
              </Button>
            </div>
          ))}
        </div>
      )}

      {reservations.map((r) => {
        const isExpanded = expanded === r.code;
        const isPending = pendingCodes.has(r.code);
        return (
          <div
            key={r.code}
            className="rounded-lg border border-border/60 bg-card px-4 py-3 print:break-inside-avoid print:border-black"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : r.code)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform print:hidden", isExpanded && "rotate-180")} />
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
              </button>

              {isPending && (
                <Badge variant="outline" className="gap-1 border-warning/40 bg-warning/10 text-warning print:hidden">
                  <CloudOff className="size-3 shrink-0" />
                  Pendiente de sincronizar
                </Badge>
              )}

              {r.status === "confirmada" && (
                <div className="flex gap-2 print:hidden">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isExecuting || isPending}
                    className="gap-1"
                    onClick={() =>
                      runOrQueue("markArrival", r.code, "Llegó", () => arrival.execute({ code: r.code }))
                    }
                  >
                    <Check className="size-3.5" />
                    Llegó
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isExecuting || isPending}
                    className="gap-1 text-destructive"
                    onClick={() =>
                      runOrQueue("markNoShow", r.code, "No asistió", () => noShow.execute({ code: r.code }))
                    }
                  >
                    <X className="size-3.5" />
                    No asistió
                  </Button>
                </div>
              )}

              {r.status === "en_curso" && (
                <div className="flex items-center gap-2 print:hidden">
                  <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
                    En curso
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isExecuting || isPending}
                    className="gap-1"
                    onClick={() =>
                      runOrQueue("releaseTable", r.code, "Liberar mesa", () => release.execute({ code: r.code }))
                    }
                  >
                    <DoorOpen className="size-3.5" />
                    Liberar mesa
                  </Button>
                </div>
              )}

              {r.status !== "confirmada" && r.status !== "en_curso" && (
                <Badge variant="outline">{RESERVATION_STATUS_LABELS[r.status] ?? r.status}</Badge>
              )}
            </div>

            {isExpanded && <CustomerFile reservation={r} />}
          </div>
        );
      })}
    </div>
  );
}
