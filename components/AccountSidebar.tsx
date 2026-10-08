"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Book,
  BookOpen,
  ClipboardCheck,
  LogOut,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import posthog from "posthog-js";
import { signOut } from "@/app/(account)/register/actions";
import { HANDBOOK_SECTIONS } from "@/lib/handbook";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const NAV = [
  { href: "/register", label: "Register as a Hacker", icon: Rocket, key: "register" },
  {
    href: "/status",
    label: "Application Status and Check-In",
    icon: ClipboardCheck,
    key: "status",
  },
] as const;

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  const pathname = usePathname();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={href === pathname} tooltip={label}>
        <Link href={href}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/**
 * The handbook's entry, with its sections folded under it. The layout puts it
 * in `extraNav` for those who can read it.
 *
 * The sections open on arriving at the handbook and fold away on leaving it.
 * While it's the page being read, the entry has nowhere to go, so pressing it
 * folds them instead, and the book closes and opens along with them.
 */
export function HandbookNavItem() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const reading = pathname === "/handbook";
  const [open, setOpen] = useState(reading);
  const [wasReading, setWasReading] = useState(reading);
  if (wasReading !== reading) {
    setWasReading(reading);
    setOpen(reading);
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={reading} tooltip="Hacker Handbook">
        <Link
          href="/handbook"
          aria-expanded={open}
          onClick={(event) => {
            if (!reading) return;
            event.preventDefault();
            setOpen(!open);
          }}
        >
          {open ? <BookOpen /> : <Book />}
          <span>Hacker Handbook</span>
        </Link>
      </SidebarMenuButton>
      {open && (
        <SidebarMenuSub className="border-l-0">
          {HANDBOOK_SECTIONS.map((section) => (
            <SidebarMenuSubItem key={section.id}>
              <SidebarMenuSubButton asChild>
                {/* On a phone the sidebar is a sheet over the page, so it has
                    to get out of the way of where the link lands. The jump is
                    made here and at once: the page's smooth scroll is cut
                    short when the sheet closes and lets go of the page. */}
                <Link
                  href={`/handbook#${section.id}`}
                  onClick={(event) => {
                    if (!isMobile) return;
                    event.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({ behavior: "instant" });
                    window.history.pushState(null, "", `#${section.id}`);
                    setOpenMobile(false);
                  }}
                >
                  <span>{section.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

/**
 * Left-hand navigation for the signed-in pages. The volunteer and mentor
 * sign-ups and the organizer dashboard are reachable by URL but deliberately
 * unlisted, so on those pages nothing here is marked active.
 *
 * `identity` is the reader's own row in the footer, and `extraNav` is any entry
 * that depends on who's reading. They're slots rather than props because the
 * layout streams them in after the rest has rendered.
 */
export default function AccountSidebar({
  identity,
  extraNav,
}: {
  identity?: React.ReactNode;
  extraNav?: React.ReactNode;
}) {
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
                <NavItem key={item.key} href={item.href} label={item.label} icon={item.icon} />
              ))}
              {extraNav}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {identity}
        <form action={handleSignOut}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="submit" tooltip="Sign Out">
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </form>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
