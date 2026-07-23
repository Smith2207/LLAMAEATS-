"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getStaffAvailableTablesAction } from "@/actions/reservations/get-staff-availability";
import { createManualReservationAction } from "@/actions/reservations/create-manual-reservation";
import { generateTimeSlots } from "@/lib/reservations/time";

type TableOption = { id: string; number: number; zone: string; seats: number };

export function ManualReservationDialog({
  defaultDate,
  openTime,
  closeTime,
}: {
  defaultDate: string;
  openTime: string;
  closeTime: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(defaultDate);
  const [timeSlot, setTimeSlot] = useState("");
  const [guests, setGuests] = useState(2);
  const [tableId, setTableId] = useState("");
  const [tableOptions, setTableOptions] = useState<TableOption[] | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  // No considera excepciones de calendario del día (feriados/horario
  // especial) — es una grilla base rápida; el servidor igual valida el
  // horario real al guardar.
  const slotOptions = generateTimeSlots(openTime, closeTime);

  const search = useAction(getStaffAvailableTablesAction, {
    onSuccess({ data }) {
      setTableOptions(data?.tables ?? []);
      setTableId("");
      if (!data?.tables?.length) toast.info("No hay mesas libres para ese horario.");
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo consultar disponibilidad.");
    },
  });

  const create = useAction(createManualReservationAction, {
    onSuccess({ data }) {
      toast.success(`Reserva ${data?.code} registrada.`);
      setOpen(false);
      setTableOptions(null);
      setTableId("");
      setGuestName("");
      setGuestPhone("");
      setNotes("");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo registrar la reserva.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Phone className="size-4" />
          Reserva telefónica / mostrador
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar reserva telefónica o de mostrador</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="manual-date">Fecha</FieldLabel>
            <Input
              id="manual-date"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTableOptions(null);
              }}
            />
          </Field>
          <Field>
            <FieldLabel>Hora</FieldLabel>
            <Select value={timeSlot} onValueChange={(v) => { setTimeSlot(v); setTableOptions(null); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elige un horario" />
              </SelectTrigger>
              <SelectContent>
                {slotOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="manual-guests">Personas</FieldLabel>
          <Input
            id="manual-guests"
            type="number"
            min={1}
            max={30}
            value={guests}
            onChange={(e) => {
              setGuests(Number(e.target.value));
              setTableOptions(null);
            }}
          />
        </Field>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-fit"
          disabled={!date || !timeSlot || search.isExecuting}
          onClick={() => search.execute({ date, timeSlot, guests })}
        >
          {search.isExecuting ? "Buscando..." : "Buscar mesas disponibles"}
        </Button>

        {tableOptions && tableOptions.length > 0 && (
          <Field>
            <FieldLabel>Mesa</FieldLabel>
            <Select value={tableId} onValueChange={setTableId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elige una mesa" />
              </SelectTrigger>
              <SelectContent>
                {tableOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    Mesa {t.number} ({t.zone}) · {t.seats} asientos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="guest-name">Nombre del cliente</FieldLabel>
            <Input id="guest-name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="guest-phone">Celular</FieldLabel>
            <Input id="guest-phone" type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="manual-notes">Notas (opcional)</FieldLabel>
          <Textarea id="manual-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </Field>

        <DialogFooter>
          <Button
            className="gap-2"
            disabled={
              create.isExecuting || !tableId || !guestName || !guestPhone || !date || !timeSlot
            }
            onClick={() =>
              create.execute({ tableId, date, timeSlot, guests, guestName, guestPhone, notes })
            }
          >
            <Plus className="size-4" />
            {create.isExecuting ? "Guardando..." : "Registrar reserva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
