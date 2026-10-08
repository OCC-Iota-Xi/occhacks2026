"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  HeartHandshake,
  LogOut,
  Mail,
  Menu,
  QrCode,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Popover } from "radix-ui";
import { signOut } from "@/app/(account)/register/actions";
import CommandPalette from "@/components/admin/CommandPalette";
import { ToastProvider } from "@/components/admin/Toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { initials } from "@/lib/admin/format";

/**
 * The frame every organizer page sits in.
 *
 * Sections the current database can't answer are simply absent rather than
 * present-and-empty: there's no teams table, so there's no Teams page — a nav
 * entry leading to "coming soon" costs an organizer a click to learn nothing.
 *
 * Settings isn't in the list: it lives in the account menu at the foot of the
 * sidebar, next to signing out, with the other things that are about the
 * organizer rather than the event.
 */
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Lit only on this exact path, for the page every other path starts with. */
  exact?: boolean;
}

const NAV_GROUPS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: Gauge, exact: true },
      { href: "/admin/applicants", label: "Applicants", icon: Users },
      { href: "/admin/helpers", label: "Volunteers & mentors", icon: HeartHandshake },
    ],
  },
  {
    title: "Event",
    items: [
      { href: "/admin/checkin", label: "Check-in", icon: QrCode },
      { href: "/admin/emails", label: "Emails", icon: Mail },
      { href: "/admin/handbook", label: "Hacker handbook", icon: BookOpen },
    ],
  },
];

const SETTINGS: NavItem = { href: "/admin/settings", label: "Settings", icon: Settings };

function isActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

/** The top bar's height: where the peeking sidebar starts, just under it. */
const BAR = "53px";

export default function AdminShell({
  email,
  name,
  children,
}: {
  email: string;
  name: string | null;
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <SidebarProvider>
        <Frame email={email} name={name}>
          {children}
        </Frame>
      </SidebarProvider>
    </ToastProvider>
  );
}

/**
 * The sidebar slides fully off screen when collapsed, so the top bar takes over
 * for it: a button that brings it back and a switcher that reaches any page
 * without opening it. Hovering that button slides the sidebar out as a floating
 * preview (a "peek"); clicking pins it open.
 */
function Frame({
  email,
  name,
  children,
}: {
  email: string;
  name: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { state, isMobile, toggleSidebar } = useSidebar();
  const [peeking, setPeeking] = useState(false);
  const isPeeking = !isMobile && state === "collapsed" && peeking;
  const collapsed = state !== "expanded" || isMobile;

  // A peek only means anything while collapsed, and a fresh collapse starts
  // closed. Reset during render against the last state seen, so the keyboard
  // shortcut counts as well as the buttons.
  const [lastState, setLastState] = useState(state);
  if (lastState !== state) {
    setLastState(state);
    setPeeking(false);
  }

  // The only thing that retracts the peek. Not a `mouseleave` on the panel: that
  // fires the moment the pointer crosses the panel's own edge, on the way up to
  // the bar, and never fires at all if the panel slides out from under a still
  // cursor. Menus opened from the panel are portalled outside it, so they count
  // as inside, and so does the whole of the sidebar's column of the screen.
  useEffect(() => {
    if (!isPeeking) return;
    const onMove = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest('[data-slot="sidebar-container"]') ||
        target?.closest("[data-sidebar-peek-trigger]") ||
        target?.closest("[data-radix-popper-content-wrapper]")
      ) {
        return;
      }
      const panel = document.querySelector('[data-slot="sidebar-container"]');
      if (panel && event.clientX <= panel.getBoundingClientRect().right) return;
      setPeeking(false);
    };
    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, [isPeeking]);

  // Collapsing puts the bar's button about where the sidebar's own collapse
  // button just was, and the browser then reports the pointer "entering" it
  // without it ever having moved — which would peek the sidebar straight back
  // open. A real hover moves the pointer first, so the button only peeks once
  // one movement has been seen since the bar appeared.
  const hoverArmed = useRef(false);
  useEffect(() => {
    hoverArmed.current = false;
    if (!collapsed) return;
    const arm = () => {
      hoverArmed.current = true;
    };
    document.addEventListener("pointermove", arm, { once: true });
    return () => document.removeEventListener("pointermove", arm);
  }, [collapsed]);

  const pages = [...NAV_GROUPS.flatMap((group) => group.items), SETTINGS];
  const current = pages.find((item) => isActive(item, pathname));
  const CurrentIcon = current?.icon ?? Gauge;

  const itemClass =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-accent/50";

  return (
    <>
      {/* The collapsed geometry — inset under the bar, rounded, shadowed — hangs
          off the collapsed state rather than off the peek, though it only shows
          while peeking: only `left` animates, so anything keyed to the peek
          would snap back the instant it cleared, before the panel had slid away. */}
      <Sidebar
        collapsible="offcanvas"
        data-peek={isPeeking ? "true" : undefined}
        className="group/sidebar z-40 group-data-[collapsible=offcanvas]:top-(--admin-bar)! group-data-[collapsible=offcanvas]:h-[calc(100svh-var(--admin-bar)-1rem)]! group-data-[collapsible=offcanvas]:overflow-hidden group-data-[collapsible=offcanvas]:rounded-r-xl group-data-[collapsible=offcanvas]:border-y group-data-[collapsible=offcanvas]:border-sidebar-border group-data-[collapsible=offcanvas]:shadow-2xl data-[peek=true]:left-0!"
        style={{ "--admin-bar": BAR } as React.CSSProperties}
      >
        <SidebarHeader className="flex min-h-[53px] flex-row items-center justify-between gap-2 px-4 py-3">
          <Link
            href="/admin"
            className="select-none font-header text-sm tracking-wider text-[var(--text-primary)] transition-opacity hover:opacity-85"
          >
            OCC<span className="text-amber-500">Hacks</span>
            <span className="ml-2 text-[10px] tracking-normal text-muted-foreground">admin</span>
          </Link>
          {/* Out of the way until the sidebar is hovered. While it is only
              peeking, this pins it open instead of collapsing it. */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isPeeking ? "Keep sidebar open" : "Collapse sidebar"}
            className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover/sidebar:opacity-100 hover:bg-sidebar-accent hover:text-foreground focus-visible:opacity-100"
          >
            {isPeeking ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </button>
        </SidebarHeader>

        <SidebarContent>
          {NAV_GROUPS.map((group, index) => (
            <SidebarGroup key={group.title ?? index}>
              {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item, pathname)}>
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
          ))}
        </SidebarContent>

        <SidebarFooter>
          <Popover.Root>
            <Popover.Trigger
              aria-label="Open account menu"
              className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors outline-none hover:bg-sidebar-accent focus-visible:bg-sidebar-accent data-[state=open]:bg-sidebar-accent"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-sidebar-border text-xs text-amber-500">
                {initials(name || email)}
              </span>
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-sm">{name || "Organizer"}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </span>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="start"
                sideOffset={6}
                className="z-100 w-(--radix-popover-trigger-width) min-w-52 rounded-lg border border-border bg-popover p-1.5 shadow-xl"
              >
                <div className="px-2 pt-1 pb-2">
                  <p className="truncate text-sm text-foreground">{name || "Organizer"}</p>
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
                <Popover.Close asChild>
                  <Link href={SETTINGS.href} className={itemClass}>
                    <Settings className="size-3.5 text-muted-foreground" />
                    Settings
                  </Link>
                </Popover.Close>
                <Popover.Close asChild>
                  <Link href="/" className={itemClass}>
                    <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    View site
                  </Link>
                </Popover.Close>
                <form action={signOut}>
                  <button type="submit" className={itemClass}>
                    <LogOut className="size-3.5 text-muted-foreground" />
                    Sign out
                  </button>
                </form>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </SidebarFooter>
      </Sidebar>

      {/* `isolate` so nothing inside a page can paint over the sidebar: the
          applicant table's sticky header and this bar both carry a z-index, and
          without a stacking context here they would compete with the peeking
          panel directly. */}
      <SidebarInset className="isolate min-h-screen min-w-0">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur-md">
          {collapsed && (
            <div data-sidebar-peek-trigger className="flex items-center gap-0.5">
              <button
                type="button"
                onMouseEnter={() => {
                  if (hoverArmed.current) setPeeking(true);
                }}
                onClick={toggleSidebar}
                aria-label={isMobile ? "Open navigation" : "Expand sidebar"}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                <Menu className="size-4" />
              </button>

              <Popover.Root>
                <Popover.Trigger
                  aria-label="Switch page"
                  className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-foreground transition-colors outline-none hover:bg-accent/50 data-[state=open]:bg-accent/50"
                >
                  <CurrentIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="max-w-40 truncate">{current?.label ?? "Admin"}</span>
                  <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    align="start"
                    sideOffset={6}
                    className="z-100 w-56 rounded-lg border border-border bg-popover p-1.5 shadow-xl"
                  >
                    {pages.map((item) => (
                      <Popover.Close asChild key={item.href}>
                        <Link href={item.href} className={itemClass}>
                          <item.icon className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="flex-1 truncate">{item.label}</span>
                          {current?.href === item.href && (
                            <Check className="size-3.5 shrink-0 text-[var(--ring)]" />
                          )}
                        </Link>
                      </Popover.Close>
                    ))}
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          )}

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
    </>
  );
}
