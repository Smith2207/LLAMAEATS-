import { requireRole } from "@/lib/auth/session";
import { ProfileForm } from "@/components/dashboard-cliente/profile-form";

export default async function PerfilPage() {
  const session = await requireRole("cliente");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">Mi perfil</h1>
      <div className="mt-6">
        <ProfileForm name={session.user.name ?? ""} phone={session.user.phone ?? ""} />
      </div>
    </main>
  );
}
