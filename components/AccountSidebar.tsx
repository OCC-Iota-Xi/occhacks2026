"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, ClipboardCheck, LogOut } from "lucide-react";
import posthog from "posthog-js";
import { signOut } from "@/app/(account)/register/actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const NAV = [
  { href: "/register", label: "register as a hacker", icon: Rocket, key: "register" },
  { href: "/status", label: "application status", icon: ClipboardCheck, key: "status" },
] as const;

/**
 * Left-hand navigation for the signed-in pages. The volunteer and mentor
 * sign-ups and the organizer dashboard are reachable by URL but deliberately
 * unlisted, so on those pages nothing here is marked active.
 *
 * `identity` is the reader's own row in the footer. It's a slot rather than
 * props because the layout streams it in after the rest has rendered.
 */
export default function AccountSidebar({ identity }: { identity?: React.ReactNode }) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    posthog.reset();
    await signOut();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-4 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/"
            className="select-none font-header text-lg tracking-wider text-[var(--text-primary)] transition-opacity group-data-[collapsible=icon]:hidden hover:opacity-85"
          >
            OCC<span className="text-amber-500">Hacks</span>
          </Link>
          <SidebarTrigger className="shrink-0" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={item.href === pathname} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {identity}
        <form action={handleSignOut}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="submit" tooltip="sign out">
                <LogOut />
                <span>sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </form>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
