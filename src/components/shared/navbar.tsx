import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { NavbarShell } from "@/components/shared/navbar-shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LayoutDashboard } from "lucide-react";
import { ROLE_HOME } from "@/lib/constants";

export async function Navbar({ hidePanelLink = false }: { hidePanelLink?: boolean } = {}) {
  const session = await auth();

  return (
    <NavbarShell>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpeg" alt="LlamaEats" width={36} height={36} className="rounded-full" priority />
          <span className="font-display text-xl font-bold text-foreground">LlamaEats</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/buscar" className="transition-colors hover:text-foreground">
            Buscar
            <span className="hidden sm:inline"> restaurantes</span>
          </Link>
          <Link
            href="/#como-funciona"
            className="hidden transition-colors hover:text-foreground md:inline"
          >
            Cómo funciona
          </Link>
          <Link href="/nosotros" className="hidden transition-colors hover:text-foreground md:inline">
            Quiénes somos
          </Link>
          <Link
            href="/para-restaurantes"
            className="hidden transition-colors hover:text-foreground sm:inline"
          >
            Para restaurantes
          </Link>
        </div>

        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="size-8">
                  <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ""} />
                  <AvatarFallback>{session.user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="truncate">{session.user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!hidePanelLink && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={ROLE_HOME[session.user.role] ?? "/dashboard"}>
                      <LayoutDashboard />
                      Mi panel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full">
                    <LogOut />
                    Cerrar sesión
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm">
            <Link href="/iniciar-sesion">Iniciar sesión</Link>
          </Button>
        )}
      </nav>
    </NavbarShell>
  );
}
