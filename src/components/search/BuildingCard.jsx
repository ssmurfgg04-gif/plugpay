"use client";

import { usePlugPay } from "@/store/context";

var MINI_STALLS = ["t", "v", "b", "e", "v", "b", "t", "e", "v", "b", "e", "b"];

export function BuildingCard({ r }) {
  const { openBuildingModal } = usePlugPay();
  return (
    <div className="res-card bldg" onClick={() => openBuildingModal(r.name)}>
      <div className="rc-top">
        <div
          className="rc-av"
          style={{
            background: "var(--grad)",
            borderRadius: "var(--r4)",
          }}
        >
          {"\u{1F3E2}"}
        </div>
        <div className="rc-info">
          <div className="rc-name">{r.name}</div>
          <div className="rc-sub">{r.sub}</div>
        </div>
      </div>
      <div className="floor-mini">
        {MINI_STALLS.map((s, i) => (
          <div className={`fm-stall ${s === "e" ? "fms-vac" : "fms-occ"}`} />
        ))}
      </div>
      <div className="rc-stats">
        <div className="rcs">
          <div className="rcs-n">{r.registered}</div>
          <div className="rcs-l">Registered</div>
        </div>
        <div className="rcs">
          <div className="rcs-n">{r.floors}</div>
          <div className="rcs-l">Floors</div>
        </div>
        <div className="rcs">
          <div className="rcs-n">
            {r.pct}
            {"%"}
          </div>
          <div className="rcs-l">Covered</div>
        </div>
      </div>
      <button className="rc-btn bd-btn-mini">{"View building \u2192"}</button>
    </div>
  );
}