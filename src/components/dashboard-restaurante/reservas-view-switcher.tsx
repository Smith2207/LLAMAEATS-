"use client";

import { useState } from "react";
import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReservationsInbox, type InboxReservation } from "@/components/dashboard-restaurante/reservations-inbox";
import { AgendaTimeline, type TimelineTable } from "@/components/dashboard-restaurante/agenda-timeline";
import { RESERVATION_ACTIVE_STATUSES } from "@/lib/constants";

export function ReservasViewSwitcher({
  reservations,
  tables,
  openTime,
  closeTime,
  turnoverBufferMinutes,
}: {
  reservations: InboxReservation[];
  tables: TimelineTable[];
  openTime: string;
  closeTime: string;
  turnoverBufferMinutes: number;
}) {
  const [view, setView] = useState<"lista" | "agenda">("lista");

  const timelineReservations = reservations.filter((r) =>
    RESERVATION_ACTIVE_STATUSES.includes(r.status),
  );

  return (
    <div>
      <div className="mb-4 flex gap-2 print:hidden">
        <Button
          type="button"
          size="sm"
          variant={view === "lista" ? "default" : "outline"}
          className="gap-1.5"
          onClick={() => setView("lista")}
        >
          <List className="size-4" />
          Lista
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === "agenda" ? "default" : "outline"}
          className="gap-1.5"
          onClick={() => setView("agenda")}
        >
          <LayoutGrid className="size-4" />
          Agenda
        </Button>
      </div>

      {view === "lista" ? (
        <ReservationsInbox reservations={reservations} />
      ) : (
        <AgendaTimeline
          tables={tables}
          reservations={timelineReservations}
          openTime={openTime}
          closeTime={closeTime}
          turnoverBufferMinutes={turnoverBufferMinutes}
        />
      )}
    </div>
  );
}
