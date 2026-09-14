import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-7 w-72" />
      <Skeleton className="h-[36rem] rounded-xl" />
    </div>
  );
}
