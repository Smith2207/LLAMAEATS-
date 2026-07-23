import { requireRole } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/navbar";
import { DashboardNav } from "@/components/shared/dashboard-nav";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/reservas", label: "Mis reservas" },
  { href: "/dashboard/perfil", label: "Perfil" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defensa en profundidad: el middleware ya filtra por rol, esta capa hace
  // el chequeo autoritativo contra la base de datos (session strategy = database).
  await requireRole("cliente");

  return (
    <div className="min-h-svh">
      <Navbar hidePanelLink />
      <DashboardNav items={NAV_ITEMS} />
      {children}
    </div>
  );
}
