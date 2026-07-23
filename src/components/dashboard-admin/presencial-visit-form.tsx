"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { recordPresencialVisitAction } from "@/actions/restaurants/record-presencial-visit";

export function PresencialVisitForm({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const { execute, isExecuting } = useAction(recordPresencialVisitAction, {
    onSuccess() {
      toast.success("Visita presencial registrada.");
      setOpen(false);
      setNote("");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo registrar la visita.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="size-4" />
          Registrar visita presencial
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar visita presencial</DialogTitle>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="visit-note">Qué se verificó en el local</FieldLabel>
          <Textarea id="visit-note" value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
        </Field>
        <DialogFooter>
          <Button disabled={isExecuting || !note} onClick={() => execute({ restaurantId, note })}>
            {isExecuting ? "Guardando..." : "Guardar visita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
