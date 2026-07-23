import { requireRole } from "@/lib/auth/session";
import { ProfileForm } from "@/components/dashboard-cliente/profile-form";
import { SessionsList } from "@/components/shared/sessions-list";
import { AccountDataControls } from "@/components/shared/account-data-controls";
import { Separator } from "@/components/ui/separator";
import { getUserSessions } from "@/lib/users/sessions";
import { getCurrentSessionToken } from "@/lib/auth/current-session";

export default async function PerfilPage() {
  const session = await requireRole("cliente");
  const [sessions, currentSessionToken] = await Promise.all([
    getUserSessions(session.user.id),
    getCurrentSessionToken(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">Mi perfil</h1>
      <div className="mt-6">
        <ProfileForm name={session.user.name ?? ""} phone={session.user.phone ?? ""} />
      </div>

      <Separator className="my-8" />

      <h2 className="font-display text-lg font-semibold text-foreground">Sesiones activas</h2>
      <div className="mt-4">
        <SessionsList sessions={sessions} currentSessionToken={currentSessionToken} />
      </div>

      <Separator className="my-8" />

      <h2 className="font-display text-lg font-semibold text-foreground">Tus datos</h2>
      <div className="mt-4">
        <AccountDataControls />
      </div>
    </main>
  );
}
