import { Skeleton } from "@/components/ui/skeleton";

export default function RestauranteReservasLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-5 w-72" />
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </main>
  );
}
