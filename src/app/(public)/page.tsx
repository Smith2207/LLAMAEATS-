import { auth, signIn } from "@/auth";
import { Hero } from "@/components/landing/hero";
import { BrandMessage } from "@/components/landing/brand-message";
import { StatsCounters } from "@/components/landing/stats-counters";
import { MarqueeRestaurants } from "@/components/landing/marquee-restaurants";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ROLE_HOME } from "@/lib/constants";

export default async function LandingPage() {
  const session = await auth();

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  return (
    <main>
      <Hero
        session={
          session?.user
            ? {
                name: session.user.name ?? null,
                homeHref: ROLE_HOME[session.user.role] ?? "/dashboard",
              }
            : null
        }
        onGoogleSignIn={signInWithGoogle}
      />
      <BrandMessage />
      <StatsCounters />
      <MarqueeRestaurants />
      <HowItWorks />
    </main>
  );
}
