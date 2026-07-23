import { Skeleton } from "@/components/ui/skeleton";

export default function BuscarLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="mt-2 h-5 w-96" />
      <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border/60">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
