import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRestaurantesLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Skeleton className="h-8 w-40" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </main>
  );
}
