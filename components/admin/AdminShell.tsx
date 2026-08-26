"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ClipboardCheck,
  Gauge,
  HeartHandshake,
  LogOut,
  QrCode,
  Settings,
  Tags,
  TrendingUp,
  Users,
} from "lucide-react";
import { signOut } from "@/app/register/actions";
import CommandPalette from "@/components/admin/CommandPalette";
import { ToastProvider } from "@/components/admin/Toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { initials } from "@/lib/admin/format";

/**
 * The frame every organizer page sits in.
 *
 * Sections the current database can't answer are simply absent rather than
 * present-and-empty: there's no teams table, so there's no Teams page — a nav
 * entry leading to "coming soon" costs an organizer a click to learn nothing.
 */
const NAV = [
  { href: "/admin", label: "Dashboard", icon: Gauge, exact: true },
  { href: "/admin/applicants", label: "Applicants", icon: Users },
  { href: "/admin/review", label: "Review queue", icon: ClipboardCheck },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin/checkin", label: "Check-in", icon: QrCode },
  { href: "/admin/helpers", label: "Volunteers & mentors", icon: HeartHandshake },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({
  email,
  name,
  children,
}: {
  email: string;
  name: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ToastProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-4 py-4 group-data-[collapsible=icon]:px-2">
            <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
              <Link
                href="/admin"
                className="select-none font-header text-sm tracking-wider text-[var(--text-primary)] transition-opacity group-data-[collapsible=icon]:hidden hover:opacity-85"
              >
                OCC<span className="text-amber-500">Hacks</span>
                <span className="ml-2 text-[10px] tracking-normal text-muted-foreground">
                  admin
                </span>
              </Link>
              <SidebarTrigger className="shrink-0" />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => {
                    const active = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  tooltip={email}
                  className="cursor-default group-data-[collapsible=icon]:justify-center hover:bg-transparent active:bg-transparent"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-sidebar-border text-xs text-amber-500">
                    {initials(name || email)}
                  </span>
                  <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm">{name || email}</span>
                    <span className="truncate text-xs text-muted-foreground">Organizer</span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <form action={signOut}>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton type="submit" tooltip="Sign out">
                    <LogOut />
                    <span>Sign out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </form>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="min-h-screen">
          <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur-md">
            <SidebarTrigger className="md:hidden" />
            <div className="ml-auto flex items-center gap-2">
              <CommandPalette />
              <Link
                href="/"
                className="flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Site
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ToastProvider>
  );
}
