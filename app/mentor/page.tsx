import type { Metadata } from "next";
import HelperPage from "@/components/HelperPage";
import { MENTOR_COPY } from "@/lib/helper-roles";

export const metadata: Metadata = {
  title: MENTOR_COPY.metaTitle,
  description: MENTOR_COPY.metaDescription,
};

export default function MentorPage() {
  return <HelperPage copy={MENTOR_COPY} />;
}
