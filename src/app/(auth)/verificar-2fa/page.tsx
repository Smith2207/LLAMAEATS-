import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { TwoFactorCodeForm } from "@/components/shared/two-factor-code-form";

export default async function Verificar2faPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const session = await auth();

  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "admin" || !session.user.twoFactorEnabled) {
    redirect(callbackUrl || "/admin");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-2xl font-bold text-foreground">
            LlamaEats
          </Link>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="size-5 text-terracota-400" />
            <h1 className="font-display text-lg font-semibold text-foreground">
              Verificación en dos pasos
            </h1>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Ingresa el código de 6 dígitos de tu app de autenticación (Google Authenticator, Authy,
            1Password, etc).
          </p>
          <TwoFactorCodeForm redirectTo={callbackUrl || "/admin"} />
        </div>
      </div>
    </main>
  );
}
