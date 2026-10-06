"use client";

import { PortalShell } from "@/components/layout/PortalShell";
import { TopBar } from "@/components/layout/TopBar";
import { WithSkeleton } from "@/components/ui/WithSkeleton";
import { PortalBottomNav } from "@/components/ui/PortalBottomNav";

var PP_CONFIG = {
  nav: {
    landlord: [
      ["dashboard", "Dashboard", "/landlord/dashboard"],
      ["buildings", "Buildings", "/landlord/buildings"],
      ["sellers", "Sellers", "/landlord/sellers"],
      ["stalls", "Stalls", "/landlord/stalls"],
    ],
    agent: [
      ["buildings", "Buildings", "/agent/buildings"],
      ["claims", "Claims", "/agent/claims"],
    ],
  },
};

export function AppShellX(props) {
  var role = props.role;
  return (
    <PortalShell
      shellClass="app-shell"
      header={<TopBar variant="app" title={role + " portal"} />}
      body={
        <main className="app-main">
          <div className="app-heading">
            <div>
              <div className="eyebrow">{role + " workspace"}</div>
              <h1>{props.title}</h1>
              {props.subtitle && <p>{props.subtitle}</p>}
            </div>
          </div>
          <WithSkeleton kind="list" dep={props.title}>
            {props.children}
          </WithSkeleton>
        </main>
      }
      nav={
        <PortalBottomNav
          items={PP_CONFIG.nav[role === "Agent" ? "agent" : "landlord"]}
          active={props.active}
          role={role}
        />
      }
    />
  );
}