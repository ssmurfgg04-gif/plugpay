"use client";

import { useState } from "react";
import { usePlugPay } from "@/store/context";
import { AppShellX } from "@/components/layout/AppShellX";
import { DashSignIn } from "@/components/layout/DashSignIn";
import { landlordVacateSeller } from "@/lib/landlord";
import { LbSwitcher } from "@/components/landlord/LbSwitcher";
import { LandlordBuildingView } from "@/components/landlord/LandlordBuildingView";
import { LlStatus } from "@/components/landlord/LlStatus";

export function LandlordStallsPage() {
  var pp = usePlugPay();
  var _f = useState("all"),
    filter = _f[0],
    setFilter = _f[1];
  if (!pp.llAuthed)
    return (
      <AppShellX role="Landlord" active="stalls" title="Stalls">
        <DashSignIn msg="Sign in to view stall occupancy." onClick={pp.openLandlordModal} />
      </AppShellX>
    );
  var pending = pp.pendingTraders || [],
    verified = pp.verifiedTraders || [],
    vacant = pp.vacantStalls || [];
  var total = pending.length + verified.length + vacant.length;
  var rows = [];
  verified.forEach(function (t) {
    rows.push({
      key: "occ-" + t.id,
      kind: "occupied",
      name: t.sub,
      meta: t.name,
      item: t,
    });
  });
  pending.forEach(function (t) {
    rows.push({
      key: "p-" + t.id,
      kind: "awaiting",
      name: t.sub,
      meta: t.name,
      item: t,
    });
  });
  vacant.forEach(function (st) {
    rows.push({
      key: "v-" + st.id,
      kind: "vacant",
      name: st.label,
      meta: "No seller yet",
      item: st,
    });
  });
  var shown = rows.filter(function (r) {
    return filter === "all" || r.kind === filter;
  });
  var tabs = [
    ["all", "All (" + total + ")"],
    ["occupied", "Occupied (" + verified.length + ")"],
    ["awaiting", "Awaiting (" + pending.length + ")"],
    ["vacant", "Vacant (" + vacant.length + ")"],
  ];
  function action(r) {
    if (r.kind === "vacant")
      return (
        <button
          className="sp-edit-btn on"
          onClick={function () {
            pp.llOpenAdmitSeller(r.item.id, r.item.label);
          }}
        >
          Admit
        </button>
      );
    if (r.kind === "awaiting")
      return (
        <button
          className="sp-edit-btn on"
          onClick={function () {
            pp.llVerifyTrader(r.item.id);
          }}
        >
          Verify
        </button>
      );
    return (
      <button
        className="sp-edit-btn danger"
        onClick={function () {
          landlordVacateSeller(pp, r.item);
        }}
      >
        Vacate
      </button>
    );
  }
  return (
    <AppShellX
      role="Landlord"
      active="stalls"
      title={pp.lbActive.name}
      subtitle="Every stall in this building and who is in it."
    >
      <LbSwitcher />
      <section className="ll-stalls-summary">
        <div>
          <b>{total}</b>
          <span>Total stalls</span>
        </div>
        <div>
          <b>{verified.length}</b>
          <span>Occupied</span>
        </div>
        <div>
          <b>{pending.length}</b>
          <span>Awaiting</span>
        </div>
        <div>
          <b>{vacant.length}</b>
          <span>Vacant</span>
        </div>
      </section>
      <LandlordBuildingView />
      <div className="ll-stalls-filter">
        {tabs.map(function (t) {
          return (
            <button
              key={t[0]}
              type="button"
              className={filter === t[0] ? "on" : ""}
              onClick={function () {
                setFilter(t[0]);
              }}
            >
              {t[1]}
            </button>
          );
        })}
      </div>
      <div className="app-list">
        {shown.map(function (r) {
          return (
            <div className="app-list-row" key={r.key}>
              <div className="app-list-main">
                <div className="app-list-name">{r.name}</div>
                <div className="app-list-meta">{r.meta}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                {r.kind === "vacant" ? (
                  <span className="pp-status pending">VACANT</span>
                ) : (
                  <LlStatus ok={r.kind === "occupied"} />
                )}
                {action(r)}
              </div>
            </div>
          );
        })}
        {shown.length === 0 && <div className="ll-empty">No stalls in this view.</div>}
      </div>
    </AppShellX>
  );
}