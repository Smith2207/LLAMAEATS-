import { requireRole } from "@/lib/auth/session";
import { listUsers } from "@/lib/users/queries";
import { UsersTable } from "@/components/dashboard-admin/users-table";

export default async function AdminUsuariosPage() {
  const session = await requireRole("admin");
  const users = await listUsers();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">Usuarios</h1>
      <div className="mt-6">
        <UsersTable users={users} currentUserId={session.user.id} />
      </div>
    </main>
  );
}
