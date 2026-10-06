"use client";

import { useContext } from "react";
import { DashCtx } from "@/lib/seller";

export function SellerDashboardTabSection3() {
  var __c = useContext(DashCtx) || {};
  var money = __c.money,
    k = __c.k,
    i = __c.i,
    cur = __c.cur,
    top = __c.top,
    topMax = __c.topMax;
  return (
    <div className="dx-card">
      <div className="dx-k">Sales by product</div>
      {top.length === 0 ? (
        <div className="dx-empty">No sales in this period.</div>
      ) : (
        top.map(function (t) {
          return (
            <div key={t.name} className="dx-row">
              <div className="dx-rowtop">
                <span className="dx-name">{t.name}</span>
                <b>{money(t.amt)}</b>
              </div>
              <div className="dx-track">
                <i
                  style={{
                    width: Math.max(4, (t.amt / topMax) * 100) + "%",
                  }}
                />
              </div>
              <div className="dx-sub">
                {t.units +
                  (t.units === 1 ? " unit" : " units") +
                  " \u00b7 " +
                  (cur ? Math.round((t.amt / cur) * 100) : 0) +
                  "% of sales"}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}