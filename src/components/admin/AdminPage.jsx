"use client";

import { useEffect, useState } from "react";
import { AppShellX } from "@/components/layout/AppShellX";
import { DashSignIn } from "@/components/layout/DashSignIn";
import { usePlugPay } from "@/store/context";

const METRICS = [
  ["buildings", "Buildings"],
  ["sellerProfiles", "Seller profiles"],
  ["agents", "Agent accounts"],
  ["landlords", "Landlord accounts"],
  ["sellerAccounts", "Seller accounts"],
  ["claimLinks", "Claim links"],
  ["receipts", "Receipts"],
  ["invoices", "Invoices"],
];

export function AdminPage() {
  const pp = usePlugPay();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pp.sessionInfo?.role !== "admin") {
      setData(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    fetch("/api/admin/overview", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body.ok !== true) throw new Error(body.error || "Could not load overview");
        if (active) setData(body);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load overview");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pp.sessionInfo?.role]);

  if (pp.sessionInfo?.role !== "admin") {
    return (
      <AppShellX role="Admin" active="overview" title="PlugPay administration">
        <DashSignIn
          msg="Administrator access is restricted to accounts provisioned by the PlugPay owner."
          onClick={() => pp.openAuthModal("admin")}
        />
      </AppShellX>
    );
  }

  return (
    <AppShellX role="Admin" active="overview" title="Platform overview" subtitle="Operational counts from the live database.">
      {loading && <div className="app-card"><div className="app-card-sub">Loading live metrics…</div></div>}
      {error && <div className="app-card" role="alert"><div className="app-card-title">Overview unavailable</div><div className="app-card-sub">{error}</div></div>}
      {data?.counts && (
        <div className="app-list">
          {METRICS.map(([key, label]) => (
            <div className="app-list-row" key={key}>
              <div className="app-list-main"><div className="app-list-name">{label}</div></div>
              <strong>{Number(data.counts[key] || 0).toLocaleString("en-KE")}</strong>
            </div>
          ))}
          <div className="app-card-sub">Last refreshed: {new Date(data.generatedAt).toLocaleString("en-KE")}</div>
        </div>
      )}
      <div className="app-actions">
        <button className="pp-btn secondary" onClick={() => pp.authLogout()}>Sign out</button>
        <button className="pp-btn primary" onClick={() => window.location.reload()}>Refresh overview</button>
      </div>
    </AppShellX>
  );
}
