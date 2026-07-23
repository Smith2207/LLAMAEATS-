import { requireRole } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/navbar";
import { DashboardNav } from "@/components/shared/dashboard-nav";

const NAV_ITEMS = [
  { href: "/restaurante", label: "Resumen" },
  { href: "/restaurante/mesas", label: "Mesas" },
  { href: "/restaurante/reservas", label: "Reservas del día" },
  { href: "/restaurante/metricas", label: "Métricas" },
  { href: "/restaurante/perfil", label: "Perfil" },
];

export default async function RestauranteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("restaurante");

  return (
    <div className="min-h-svh">
      <Navbar />
      <DashboardNav items={NAV_ITEMS} />
      {children}
    </div>
  );
}
