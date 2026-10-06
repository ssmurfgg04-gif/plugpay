"use client";

import { BottomNav } from "@/components/ui/BottomNav";

export function PortalBottomNav(p) {
  return (
    <BottomNav
      className={p.role === "Agent" ? "agent-bottom-nav" : "landlord-bottom-nav"}
      itemClass="pbn-item"
      style={{
        gridTemplateColumns: "repeat(" + p.items.length + ", 1fr)",
      }}
      active={p.active}
      items={p.items}
    />
  );
}