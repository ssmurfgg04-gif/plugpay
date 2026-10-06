"use client";

import { usePlugPay } from "@/store/context";
import { AppShellX } from "@/components/layout/AppShellX";
import { claimLink } from "@/lib/agent";
import { EmptyState } from "@/components/ui/EmptyState";

export function AgentClaimsPage() {
  var pp = usePlugPay();
  return (
    <AppShellX
      role="Agent"
      active="claims"
      title="Seller claim links"
      subtitle="A claim link goes to each seller's WhatsApp as soon as you register them. It opens the sign-in page."
    >
      <div className="app-list">
        {pp.agentClaims
          .filter(function (c) {
            return c.source !== "landlord";
          })
          .map(function (c) {
            return (
              <div className="app-card" key={c.id}>
                <div
                  className="app-list-row"
                  style={{
                    border: 0,
                    padding: 0,
                  }}
                >
                  <div className="app-list-main">
                    <div className="app-list-name">{c.businessName || "Unnamed seller"}</div>
                    <div className="app-list-meta">
                      {c.ownerName +
                        " \u00b7 " +
                        (c.phone || "No phone") +
                        " \u00b7 " +
                        c.buildingName +
                        " \u00b7 " +
                        c.loc}
                    </div>
                  </div>
                  <span className={"pp-status" + (c.status !== "INVITED" ? "" : " pending")}>
                    {c.status === "INVITED" ? "LINK SENT" : "CLAIMED"}
                  </span>
                </div>
                {c.status === "INVITED" && (
                  <div className="app-actions">
                    <button
                      className="pp-btn primary"
                      onClick={function () {
                        pp.resendClaim(c.token);
                      }}
                    >
                      Resend on WhatsApp
                    </button>
                    <button
                      className="pp-btn secondary"
                      onClick={function () {
                        pp.copyText(claimLink(c.token), "Claim link copied");
                      }}
                    >
                      Copy link
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        {pp.agentClaims.filter(function (c) {
          return c.source !== "landlord";
        }).length === 0 && (
          <EmptyState
            icon="mail"
            title="No claim links yet"
            sub="Register a seller in a building and their claim link is sent to WhatsApp automatically."
            action={{
              label: "Onboard a building",
              onClick: pp.openOnboard,
            }}
          />
        )}
      </div>
    </AppShellX>
  );
}