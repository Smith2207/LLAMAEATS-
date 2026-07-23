import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { OnboardingForm } from "@/components/shared/onboarding-form";

export default async function OnboardingPage() {
  const session = await requireSession("/onboarding");

  if (session.user.phone) {
    redirect(session.user.role === "restaurante" ? "/restaurante" : "/dashboard");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Bienvenido a LlamaEats
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cuéntanos un poco más para terminar de crear tu cuenta.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  );
}
