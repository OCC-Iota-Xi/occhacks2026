import { Skeleton } from "@/components/ui/skeleton";

/**
 * Stands in for a signed-in page while its data is in flight. The sidebar and
 * backdrop belong to the layout and stay where they are, so this is only the
 * heading and the card under it.
 */
export default function AccountLoading() {
  return (
    <section
      aria-busy="true"
      className="relative z-10 mx-auto w-full max-w-2xl px-6 py-16 sm:px-12"
    >
      <Skeleton className="mx-auto h-10 w-72 max-w-full sm:h-12" />
      <Skeleton className="mt-10 h-64 rounded-2xl" />
    </section>
  );
}
