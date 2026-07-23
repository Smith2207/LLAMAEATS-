"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportMyDataAction, deleteMyAccountAction } from "@/actions/users/export-delete";

export function AccountDataControls() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const { execute: exportData, isExecuting: isExporting } = useAction(exportMyDataAction, {
    onSuccess({ data }) {
      if (!data) return;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "llamaeats-mis-datos.json";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo exportar tus datos.");
    },
  });

  const { execute: deleteAccount, isExecuting: isDeleting } = useAction(deleteMyAccountAction, {
    onSuccess() {
      toast.success("Cuenta eliminada.");
      router.push("/");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo eliminar la cuenta.");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button type="button" variant="outline" className="gap-2" disabled={isExporting} onClick={() => exportData({})}>
          <Download className="size-4" />
          {isExporting ? "Exportando..." : "Exportar mis datos"}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          Descarga un archivo con tu perfil, reservas y reseñas.
        </p>
      </div>

      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
        <p className="text-sm font-medium text-destructive">Eliminar mi cuenta</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Se elimina tu información personal (nombre, correo, celular). Tus reservas pasadas quedan
          en el historial de forma anónima por razones contables. Esta acción no se puede deshacer.
        </p>
        {!confirming ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 gap-2 text-destructive"
            onClick={() => setConfirming(true)}
          >
            <Trash2 className="size-4" />
            Eliminar mi cuenta
          </Button>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive"
              disabled={isDeleting}
              onClick={() => deleteAccount({})}
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar definitivamente"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
