import { Skeleton } from "@/components/ui/skeleton";

export default function MisReservasLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-6 h-9 w-56" />
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </main>
  );
}
