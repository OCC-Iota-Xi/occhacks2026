"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

/**
 * The signed-in reader's row at the foot of the sidebar. Also where PostHog
 * learns who they are, since this is the first thing to render with their id.
 */
export default function AccountIdentity({
  userId,
  email,
  name,
}: {
  userId: string;
  email?: string | null;
  name?: string | null;
}) {
  useEffect(() => {
    posthog.identify(userId, {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    });
  }, [userId, email, name]);

  if (!email) return null;

  const initial = (name || email).trim().charAt(0).toUpperCase();

  return (
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
  );
}
