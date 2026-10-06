"use client";

import { usePlugPay } from "@/store/context";
import { AppShellX } from "@/components/layout/AppShellX";
import { EmptyState } from "@/components/ui/EmptyState";

export function AgentBuildingsPage() {
  var pp = usePlugPay();
  return (
    <AppShellX
      role="Agent"
      active="buildings"
      title="Agent buildings"
      subtitle="Buildings and stalls you have onboarded into PlugPay."
    >
      <div className="app-list">
        {pp.agentBuildings.map(function (b, i) {
          return (
            <div className="app-list-row" key={i}>
              <div className="app-list-main">
                <div className="app-list-name">{b.name}</div>
                <div className="app-list-meta">
                  {b.street +
                    " \u00b7 " +
                    b.floorsCount +
                    " floors \u00b7 " +
                    b.stalls +
                    " stalls \u00b7 " +
                    b.merchants +
                    " sellers"}
                </div>
              </div>
              <button
                className="pp-btn secondary"
                onClick={function () {
                  pp.openBuildingModal(b.name);
                }}
              >
                View
              </button>
            </div>
          );
        })}
        {pp.agentBuildings.length === 0 && (
          <EmptyState
            icon="building-2"
            title="No buildings yet"
            sub="Onboard your first building to start registering sellers."
            action={{
              label: "Onboard a building",
              onClick: pp.openOnboard,
            }}
          />
        )}
      </div>
      <div className="app-actions">
        <button className="pp-btn primary" onClick={pp.openOnboard}>
          {"+ Onboard another building"}
        </button>
      </div>
    </AppShellX>
  );
}