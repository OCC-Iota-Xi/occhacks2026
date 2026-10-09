import { Suspense } from "react";
import AccountBackdrop from "@/components/AccountBackdrop";
import AccountIdentity from "@/components/AccountIdentity";
import AccountSidebar from "@/components/AccountSidebar";
// import { HandbookNavItem, RegisterAlert } from "@/components/AccountSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { needsClassSection } from "@/lib/extra-credit";
import { HELPER_TABLE } from "@/lib/helper-roles";
// import { canReadHandbook } from "@/lib/read-applicant-stage";
import { createClient, getSessionUser } from "@/lib/supabase/server";

/**
 * Who the sidebar's footer names. The name is whichever sign-up has one — a
 * volunteer who never applied as a hacker still has theirs shown.
 */
async function Identity() {
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) return null;

  const [hacker, volunteer, mentor] = await Promise.all([
    supabase.from("hackers").select("full_name").eq("user_id", user.id).maybeSingle(),
    supabase.from(HELPER_TABLE.volunteer).select("full_name").eq("user_id", user.id).maybeSingle(),
    supabase.from(HELPER_TABLE.mentor).select("full_name").eq("user_id", user.id).maybeSingle(),
  ]);
  const name =
    hacker.data?.full_name ?? volunteer.data?.full_name ?? mentor.data?.full_name ?? null;

  return <AccountIdentity userId={user.id} email={user.email} name={name} />;
}

// Off for now: the handbook's sidebar entry and the extra credit reminder.
// /** The handbook's sidebar entry, for the readers `/handbook` itself lets in. */
// async function HandbookNav() {
//   const supabase = await createClient();
//   const user = await getSessionUser(supabase);
//   // Dev-only: listed without a session, as the page can be viewed without one.
//   if (!user) return process.env.NODE_ENV === "development" ? <HandbookNavItem /> : null;
//
//   return (await canReadHandbook(user)) ? <HandbookNavItem /> : null;
// }
//
// /** The reminder on the registration entry, while a class is missing its section. */
// async function RegisterReminder() {
//   const supabase = await createClient();
//   const user = await getSessionUser(supabase);
//   if (!user) return null;
//
//   return (await needsClassSection(supabase, user)) ? <RegisterAlert /> : null;
// }

/**
 * The frame every signed-in page sits in: sidebar, mobile header and the space
 * backdrop. It lives here rather than in each page so moving between pages
 * swaps only the content — the sidebar keeps its state and the particle field
 * isn't torn down and redrawn.
 *
 * Nothing here waits on data. The reads, the name in the sidebar's footer,
 * whether to list the handbook and whether registration needs a reminder, are
 * each behind their own Suspense boundary: a
 * layout that awaits holds up the whole navigation, and `loading.tsx` can't
 * cover for it.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    // A touch wider than the default 16rem, so the longest label isn't cut off.
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <AccountSidebar
        identity={
          <Suspense fallback={null}>
            <Identity />
          </Suspense>
        }
        // extraNav={
        //   <Suspense fallback={null}>
        //     <HandbookNav />
        //   </Suspense>
        // }
        // registerAlert={
        //   <Suspense fallback={null}>
        //     <RegisterReminder />
        //   </Suspense>
        // }
      />
      {/* `clip`, not `hidden`: it cuts off the backdrop the same way without
          making this a scroll container, which would stop anything inside it
          from sticking to the viewport. */}
      <SidebarInset className="relative min-h-screen overflow-clip">
        <header className="sticky top-0 z-50 flex items-center border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:hidden">
          <SidebarTrigger />
        </header>

        <AccountBackdrop />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
