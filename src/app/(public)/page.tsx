import { signIn } from "@/auth";
import { Hero } from "@/components/landing/hero";
import { BrandMessage } from "@/components/landing/brand-message";
import { StatsCounters } from "@/components/landing/stats-counters";
import { MarqueeRestaurants } from "@/components/landing/marquee-restaurants";
import { HowItWorks } from "@/components/landing/how-it-works";

export default function LandingPage() {
  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  return (
    <main>
      <Hero onGoogleSignIn={signInWithGoogle} />
      <BrandMessage />
      <StatsCounters />
      <MarqueeRestaurants />
      <HowItWorks />
    </main>
  );
}
