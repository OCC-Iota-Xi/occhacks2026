import { Suspense } from "react";
import AccountBackdrop from "@/components/AccountBackdrop";
import AccountIdentity from "@/components/AccountIdentity";
import AccountSidebar from "@/components/AccountSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { HELPER_TABLE } from "@/lib/helper-roles";
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

/**
 * The frame every signed-in page sits in: sidebar, mobile header and the space
 * backdrop. It lives here rather than in each page so moving between pages
 * swaps only the content — the sidebar keeps its state and the particle field
 * isn't torn down and redrawn.
 *
 * Nothing here waits on data. The one read, the name in the sidebar's footer,
 * is behind its own Suspense boundary: a layout that awaits holds up the whole
 * navigation, and `loading.tsx` can't cover for it.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AccountSidebar
        identity={
          <Suspense fallback={null}>
            <Identity />
          </Suspense>
        }
      />
      <SidebarInset className="relative min-h-screen overflow-hidden">
        <header className="sticky top-0 z-50 flex items-center border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:hidden">
          <SidebarTrigger />
        </header>

        <AccountBackdrop />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
