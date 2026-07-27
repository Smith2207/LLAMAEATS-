"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { BellRing, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { leaveWaitlistAction } from "@/actions/waitlist/leave-waitlist";

export type WaitlistEntryItem = {
  id: string;
  date: string;
  timeSlot: string;
  guests: number;
  status: string;
  restaurant: { name: string; slug: string };
};

export function WaitlistEntryCard({ entry }: { entry: WaitlistEntryItem }) {
  const router = useRouter();
  const { execute, isExecuting } = useAction(leaveWaitlistAction, {
    onSuccess() {
      toast.success("Saliste de la lista de espera.");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo salir de la lista de espera.");
    },
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
      <div>
        <p className="font-medium text-foreground">{entry.restaurant.name}</p>
        <p className="text-xs text-muted-foreground">
          {entry.date} · {entry.timeSlot.slice(0, 5)} · {entry.guests}{" "}
          {entry.guests === 1 ? "persona" : "personas"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {entry.status === "notificada" ? (
          <Badge variant="outline" className="gap-1 border-success/40 bg-success/10 text-success">
            <BellRing className="size-3" />
            Cupo disponible
          </Badge>
        ) : (
          <Badge variant="outline">En espera</Badge>
        )}

        {entry.status === "notificada" && (
          <Button size="sm" asChild>
            <Link
              href={`/restaurantes/${entry.restaurant.slug}/reservar?date=${entry.date}&timeSlot=${entry.timeSlot.slice(0, 5)}&guests=${entry.guests}`}
            >
              Reservar
            </Link>
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="gap-1 text-destructive"
          disabled={isExecuting}
          onClick={() => execute({ id: entry.id })}
        >
          <X className="size-3.5" />
          Salir
        </Button>
      </div>
    </div>
  );
}
