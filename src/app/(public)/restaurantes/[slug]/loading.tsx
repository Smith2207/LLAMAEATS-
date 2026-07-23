import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantDetailLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Skeleton className="aspect-video w-full rounded-2xl" />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-3 h-9 w-2/3" />
          <Skeleton className="mt-3 h-5 w-full" />
          <Skeleton className="mt-1 h-5 w-3/4" />
          <Skeleton className="mt-4 h-5 w-1/2" />
        </div>
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    </main>
  );
}
