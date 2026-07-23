import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RESERVATION_STATUS_LABELS } from "@/lib/constants";

const STATUS_VARIANT: Record<string, string> = {
  pendiente: "border-primary/40 bg-primary/10 text-primary",
  confirmada: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  cancelada: "border-destructive/40 bg-destructive/10 text-destructive",
  completada: "border-border bg-secondary text-muted-foreground",
  no_asistio: "border-destructive/40 bg-destructive/10 text-destructive",
};

export type ReservationCardData = {
  code: string;
  date: string;
  timeSlot: string;
  guests: number;
  status: string;
  restaurant: { name: string; district: string } | null;
  table: { number: number; zone: string } | null;
};

export function ReservationCard({ reservation }: { reservation: ReservationCardData }) {
  return (
    <Link
      href={`/dashboard/reservas/${reservation.code}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div>
        <p className="font-display font-semibold text-foreground">
          {reservation.restaurant?.name ?? "Restaurante"}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {reservation.date} · {reservation.timeSlot.slice(0, 5)}
          </span>
          {reservation.restaurant && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {reservation.restaurant.district}
            </span>
          )}
          <span>
            {reservation.guests} {reservation.guests === 1 ? "persona" : "personas"}
          </span>
        </div>
      </div>
      <Badge variant="outline" className={STATUS_VARIANT[reservation.status]}>
        {RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status}
      </Badge>
    </Link>
  );
}
