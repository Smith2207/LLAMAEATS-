import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getUserById } from "@/lib/users/queries";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UsersTable } from "@/components/dashboard-admin/users-table";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("admin");
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  const userReservations = await db.query.reservations.findMany({
    where: eq(reservations.userId, id),
    orderBy: (r, { desc }) => [desc(r.createdAt)],
    limit: 10,
    with: { restaurant: { columns: { name: true } } },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-foreground">{user.name ?? user.email}</h1>
      <p className="text-sm text-muted-foreground">{user.email}</p>

      <div className="mt-6">
        <UsersTable users={[user]} currentUserId={session.user.id} />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium text-muted-foreground">Últimas reservas</h2>
      {userReservations.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin reservas todavía.</p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm">
          {userReservations.map((r) => (
            <li key={r.id} className="rounded-lg border border-border/60 bg-card px-4 py-2">
              <span className="text-foreground">{r.restaurant.name}</span>{" "}
              <span className="text-muted-foreground">
                — {r.date} {r.timeSlot.slice(0, 5)} · {r.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
