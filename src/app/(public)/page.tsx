import { auth, signIn } from "@/auth";
import { Hero } from "@/components/landing/hero";
import { BrandMessage } from "@/components/landing/brand-message";
import { FeaturedCategories } from "@/components/landing/featured-categories";
import { StatsCounters } from "@/components/landing/stats-counters";
import { HowItWorks } from "@/components/landing/how-it-works";
import { getFeaturedRestaurant } from "@/lib/restaurants/queries";
import { ROLE_HOME } from "@/lib/constants";

export default async function LandingPage() {
  const session = await auth();
  const featured = await getFeaturedRestaurant();

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
        featured={
          featured
            ? {
                slug: featured.slug,
                name: featured.name,
                district: featured.district,
                avgRating: featured.avgRating,
              }
            : null
        }
      />
      <FeaturedCategories />
      <BrandMessage />
      <StatsCounters />
      <HowItWorks />
    </main>
  );
}
