"use client";

import { useEffect, useState } from "react";
import { PlugPayProvider } from "@/store/PlugPayProvider";
import { PPBoundary } from "@/components/ui/PPBoundary";
import { GlobalModals } from "@/components/ui/GlobalModals";
import { RouterBridge } from "@/components/shared/RouterBridge";
import { RouteEffects } from "@/components/shared/RouteEffects";

// Client shell: store -> error boundary -> routed page -> global modals.
// The store reads localStorage and the current time while rendering, so the tree mounts on the
// client only (no server/client markup to mismatch).
export function AppRoot({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <PlugPayProvider>
      <PPBoundary>
        <RouterBridge />
        <RouteEffects />
        {children}
        <GlobalModals />
      </PPBoundary>
    </PlugPayProvider>
  );
}