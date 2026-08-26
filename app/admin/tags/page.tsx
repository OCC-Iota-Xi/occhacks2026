import SetupNotice from "@/components/admin/SetupNotice";
import TagManager from "@/components/admin/TagManager";
import { PageHeader } from "@/components/admin/ui";
import { adminContext, fetchTagUsage, fetchTags } from "@/lib/admin/queries";

export default async function TagsPage() {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const [tags, usage] = await Promise.all([fetchTags(ctx), fetchTagUsage(ctx)]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tags"
        subtitle="Shared across every organizer. Applicants never see them."
      />
      <TagManager tags={tags} usage={usage} />
    </div>
  );
}
