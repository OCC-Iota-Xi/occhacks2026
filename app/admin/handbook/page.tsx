import Handbook from "@/components/Handbook";

/**
 * The hacker handbook, as confirmed hackers see it at `/handbook`, without
 * leaving the dashboard. The admin layout has already checked who's asking.
 */
export default function AdminHandbookPage() {
  return <Handbook />;
}
