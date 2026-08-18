"use client";

import Link from "next/link";
import { Rocket, HeartHandshake, Compass, LogOut } from "lucide-react";
import { signOut } from "@/app/register/actions";
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

// Volunteering and mentoring are separate sign-ups, so they're separate
// entries — someone can be on both rosters.
const NAV = [
  { href: "/register", label: "register as a hacker", icon: Rocket, key: "register" },
  { href: "/volunteer", label: "volunteer", icon: HeartHandshake, key: "volunteer" },
  { href: "/mentor", label: "mentor", icon: Compass, key: "mentor" },
] as const;

/** Left-hand navigation for the signed-in pages (register / volunteer / mentor). */
export default function AccountSidebar({
  active,
  email,
  name,
}: {
  active: "register" | "volunteer" | "mentor";
  email?: string | null;
  name?: string | null;
}) {
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();

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
                  <SidebarMenuButton
                    asChild
                    isActive={item.key === active}
                    tooltip={item.label}
                  >
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
        {email && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip={email}
                className="cursor-default group-data-[collapsible=icon]:justify-center hover:bg-transparent active:bg-transparent"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-sidebar-border text-xs text-amber-500">
                  {initial}
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  {name && <span className="truncate text-sm">{name}</span>}
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <form action={signOut}>
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
