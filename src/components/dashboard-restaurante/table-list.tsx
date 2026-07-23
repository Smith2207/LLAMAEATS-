"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableForm } from "./table-form";
import { toggleTableActiveAction } from "@/actions/tables/toggle-table-active";
import { deleteTableAction } from "@/actions/tables/delete-table";

export type TableItem = {
  id: string;
  number: number;
  minSeats: number;
  seats: number;
  zone: string;
  isActive: boolean;
  platformBookable: boolean;
};

export function TableList({ tables }: { tables: TableItem[] }) {
  const router = useRouter();

  const { execute: toggle } = useAction(toggleTableActiveAction, {
    onSuccess: () => router.refresh(),
    onError: ({ error }) => toast.error(error.serverError ?? "No se pudo actualizar."),
  });

  const { execute: remove } = useAction(deleteTableAction, {
    onSuccess: () => {
      toast.success("Mesa eliminada.");
      router.refresh();
    },
    onError: ({ error }) => toast.error(error.serverError ?? "No se pudo eliminar."),
  });

  const zones = Array.from(new Set(tables.map((t) => t.zone)));

  return (
    <div className="flex flex-col gap-6">
      {zones.map((zone) => (
        <div key={zone}>
          <p className="mb-2 text-sm font-medium text-muted-foreground">{zone}</p>
          <div className="flex flex-col gap-2">
            {tables
              .filter((t) => t.zone === zone)
              .map((table) => (
                <div
                  key={table.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display font-semibold text-foreground">
                      Mesa {table.number}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      {table.minSeats}–{table.seats}
                    </span>
                    {!table.isActive && <Badge variant="outline">Inactiva</Badge>}
                    {!table.platformBookable && <Badge variant="outline">Solo mostrador</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={table.isActive}
                      onCheckedChange={() => toggle({ tableId: table.id })}
                    />
                    <TableForm table={table} />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove({ tableId: table.id })}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
