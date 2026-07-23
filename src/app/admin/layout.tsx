import { requireRole } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/navbar";
import { DashboardNav } from "@/components/shared/dashboard-nav";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/restaurantes", label: "Restaurantes" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/seguridad", label: "Seguridad" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");

  return (
    <div className="min-h-svh">
      <Navbar hidePanelLink />
      <DashboardNav items={NAV_ITEMS} />
      {children}
    </div>
  );
}
