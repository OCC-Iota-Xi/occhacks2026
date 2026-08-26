import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a page's server data is in flight — the shape of what's coming. */
export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[74px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-3">
        <Skeleton className="h-64 rounded-xl xl:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    </div>
  );
}
