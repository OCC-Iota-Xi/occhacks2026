import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { adminContext, fetchAdmins } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: "admin — OCC Hacks 2026",
  // Applicant details behind a login, but there's no reason for the URL itself
  // to be crawlable either.
  robots: { index: false, follow: false },
};

/**
 * Nothing under /admin is ever prerendered or cached: every page reads live
 * applicant data through the signed-in organizer's session, and a cached copy
 * would be the wrong data for the next person to load it.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The proxy already turned away anyone who isn't an organizer. This is the
  // check that matters: it runs on the server, on every render, and a proxy
  // misconfiguration can't route around it.
  const ctx = await adminContext();
  const admins = ctx.ready ? await fetchAdmins(ctx) : [];
  const me = admins.find((admin) => admin.user_id === ctx.userId);

  return (
    <AdminShell email={ctx.email} name={me?.display_name ?? null}>
      {children}
    </AdminShell>
  );
}
