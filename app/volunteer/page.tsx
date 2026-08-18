import type { Metadata } from "next";
import HelperPage from "@/components/HelperPage";
import { VOLUNTEER_COPY } from "@/lib/helper-roles";

export const metadata: Metadata = {
  title: VOLUNTEER_COPY.metaTitle,
  description: VOLUNTEER_COPY.metaDescription,
};

export default function VolunteerPage() {
  return <HelperPage copy={VOLUNTEER_COPY} />;
}
