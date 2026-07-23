"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { LogOut, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revokeAllOtherSessionsAction, revokeSessionAction } from "@/actions/users/sessions";

export type SessionItem = { sessionToken: string; expires: Date };

export function SessionsList({
  sessions,
  currentSessionToken,
}: {
  sessions: SessionItem[];
  currentSessionToken: string | null;
}) {
  const router = useRouter();

  const onSuccess = () => {
    toast.success("Sesión cerrada.");
    router.refresh();
  };
  const onError = ({ error }: { error: { serverError?: string } }) => {
    toast.error(error.serverError ?? "No se pudo cerrar la sesión.");
  };

  const revoke = useAction(revokeSessionAction, { onSuccess, onError });
  const revokeAll = useAction(revokeAllOtherSessionsAction, {
    onSuccess: () => {
      toast.success("Se cerraron las demás sesiones.");
      router.refresh();
    },
    onError,
  });

  const otherSessions = sessions.filter((s) => s.sessionToken !== currentSessionToken);

  return (
    <div className="flex flex-col gap-2">
      {sessions.map((s) => {
        const isCurrent = s.sessionToken === currentSessionToken;
        return (
          <div
            key={s.sessionToken}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <Monitor className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-foreground">
                  Sesión ···{s.sessionToken.slice(-6)} {isCurrent && <Badge variant="outline">Esta sesión</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">Expira {s.expires.toISOString().slice(0, 10)}</p>
              </div>
            </div>
            {!isCurrent && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={revoke.isExecuting}
                onClick={() => revoke.execute({ sessionToken: s.sessionToken })}
              >
                <LogOut className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      })}
      {otherSessions.length > 0 && currentSessionToken && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 w-fit gap-2 text-destructive"
          disabled={revokeAll.isExecuting}
          onClick={() => revokeAll.execute({ currentSessionToken })}
        >
          <LogOut className="size-4" />
          Cerrar todas las demás sesiones
        </Button>
      )}
    </div>
  );
}
