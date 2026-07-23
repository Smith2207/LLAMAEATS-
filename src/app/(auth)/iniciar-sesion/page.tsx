import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/auth";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { SubmitButton } from "@/components/shared/submit-button";
import { GoogleIcon } from "@/components/shared/google-icon";

export default async function IniciarSesionPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = callbackUrl ?? "/";

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo });
  }

  async function signInWithEmail(formData: FormData) {
    "use server";
    try {
      await signIn("nodemailer", formData);
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/iniciar-sesion?error=${err.type}`);
      }
      throw err;
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-2xl font-bold text-foreground">
            LlamaEats
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu mesa en Puno, asegurada en minutos.
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          {error && (
            <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              No se pudo iniciar sesión. Intenta de nuevo.
            </p>
          )}

          <form action={signInWithGoogle}>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <SubmitButton
              size="lg"
              className="w-full gap-2"
              pendingLabel="Redirigiendo..."
            >
              <GoogleIcon className="size-4" />
              Continuar con Google
            </SubmitButton>
          </form>

          <FieldSeparator className="my-6">o con tu correo</FieldSeparator>

          <form action={signInWithEmail} className="flex flex-col gap-3">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Field>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <Input id="email" name="email" type="email" required placeholder="tucorreo@ejemplo.com" />
            </Field>
            <SubmitButton variant="outline" size="lg" pendingLabel="Enviando enlace...">
              Enviarme un enlace mágico
            </SubmitButton>
          </form>
        </div>
      </div>
    </main>
  );
}
