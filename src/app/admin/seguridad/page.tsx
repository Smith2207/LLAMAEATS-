import { requireRole } from "@/lib/auth/session";
import { TwoFactorSetup } from "@/components/dashboard-admin/two-factor-setup";
import { SessionsList } from "@/components/shared/sessions-list";
import { Separator } from "@/components/ui/separator";
import { getUserSessions } from "@/lib/users/sessions";
import { getCurrentSessionToken } from "@/lib/auth/current-session";

export default async function AdminSeguridadPage() {
  const session = await requireRole("admin");
  const [sessions, currentSessionToken] = await Promise.all([
    getUserSessions(session.user.id),
    getCurrentSessionToken(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">Seguridad</h1>

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold text-foreground">
        Verificación en dos pasos
      </h2>
      <TwoFactorSetup enabled={session.user.twoFactorEnabled} />

      <Separator className="my-8" />

      <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Sesiones activas</h2>
      <SessionsList sessions={sessions} currentSessionToken={currentSessionToken} />
    </main>
  );
}
