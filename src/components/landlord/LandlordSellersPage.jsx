"use client";

import { usePlugPay } from "@/store/context";
import { AppShellX } from "@/components/layout/AppShellX";
import { DashSignIn } from "@/components/layout/DashSignIn";
import { LbSwitcher } from "@/components/landlord/LbSwitcher";
import { LlStatus } from "@/components/landlord/LlStatus";
import { landlordVacateSeller } from "@/lib/landlord";
import { EmptyState } from "@/components/ui/EmptyState";

export function LandlordSellersPage() {
  var pp = usePlugPay();
  if (!pp.llAuthed)
    return (
      <AppShellX role="Landlord" active="sellers" title="Sellers & verification">
        <DashSignIn msg="Sign in to review your sellers." onClick={pp.openLandlordModal} />
      </AppShellX>
    );
  var total = pp.pendingTraders.length + pp.verifiedTraders.length;
  var sp = pp.sellerProfile,
    spVerified = !!sp.llPhoneVerified,
    here = pp.stallAssignment.building.trim().toLowerCase() === pp.lbActive.name.trim().toLowerCase();
  return (
    <AppShellX
      role="Landlord"
      active="sellers"
      title={pp.lbActive.name}
      subtitle="Verify each seller who claims a stall. Pending until you do."
    >
      <LbSwitcher />
      {here && (
        <div
          className="app-card"
          style={{
            marginBottom: 14,
          }}
        >
          <div
            className="app-list-row"
            style={{
              border: 0,
              padding: 0,
            }}
          >
            <div className="app-list-main">
              <div className="app-list-name">{sp.bizName}</div>
              <div className="app-list-meta">
                {sp.ownerName + " \u00b7 " + sp.phone + " \u00b7 " + pp.stallAssignment.loc}
              </div>
            </div>
            <LlStatus ok={spVerified} />
          </div>
          <div className="app-actions">
            {spVerified ? (
              <button
                className="pp-btn danger"
                onClick={function () {
                  pp.setLandlordPhoneVerified(false);
                }}
              >
                Set back to Pending
              </button>
            ) : (
              <button
                className="pp-btn primary"
                onClick={function () {
                  pp.setLandlordPhoneVerified(true);
                }}
              >
                Verify
              </button>
            )}
          </div>
        </div>
      )}
      <div className="app-list">
        {pp.pendingTraders.map(function (t) {
          return (
            <div className="app-list-row" key={t.id}>
              <div className="app-list-main">
                <div className="app-list-name">{t.name}</div>
                <div className="app-list-meta">{t.sub}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <LlStatus ok={false} />
                <button
                  className="pp-btn primary"
                  onClick={function () {
                    pp.llVerifyTrader(t.id);
                  }}
                >
                  Verify
                </button>
              </div>
            </div>
          );
        })}
        {pp.verifiedTraders.map(function (t) {
          return (
            <div className="app-list-row" key={t.id}>
              <div className="app-list-main">
                <div className="app-list-name">{t.name}</div>
                <div className="app-list-meta">{t.sub}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <LlStatus ok={true} />
                <button
                  className="pp-btn danger"
                  onClick={function () {
                    landlordVacateSeller(pp, t);
                  }}
                >
                  Mark vacated
                </button>
              </div>
            </div>
          );
        })}
        {total === 0 && (
          <EmptyState
            icon="store"
            title="No sellers in this building"
            sub="Admit a seller from a vacant stall to get started."
          />
        )}
      </div>
    </AppShellX>
  );
}