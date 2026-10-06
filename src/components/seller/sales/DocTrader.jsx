"use client";

import { initials } from "@/lib/shared";

export function DocTrader(props) {
  var sp = props.sp;
  return (
    <div className="doc-trader">
      <div className="doc-trader-av">{initials(sp.bizName || "P")}</div>
      <div>
        <div className="doc-trader-name">{sp.bizName}</div>
        <div className="doc-trader-meta">
          <span>{sp.role || "Seller"}</span>
          {sp.street && <span>{"\u00b7 " + sp.street}</span>}
          {sp.phone && <span>{"\u00b7 " + sp.phone}</span>}
        </div>
      </div>
    </div>
  );
}