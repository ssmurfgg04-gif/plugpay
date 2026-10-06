"use client";

import { useContext } from "react";
import { DashCtx } from "@/lib/seller";

export function SellerDashboardTabSection4() {
  var __c = useContext(DashCtx) || {};
  var money = __c.money,
    k = __c.k,
    i = __c.i,
    catAgg = __c.catAgg;
  return (
    <div className="dx-card">
      <div className="dx-k">Sales by category</div>
      {Object.keys(catAgg).length === 0 ? (
        <div className="dx-empty">No categorised sales in this period.</div>
      ) : (
        Object.keys(catAgg)
          .sort(function (a, b) {
            return catAgg[b] - catAgg[a];
          })
          .map(function (k) {
            var mx = Math.max.apply(
              null,
              Object.keys(catAgg).map(function (x) {
                return catAgg[x];
              }),
            );
            return (
              <div key={k} className="dx-row">
                <div className="dx-rowtop">
                  <span className="dx-name">{k}</span>
                  <b>{money(catAgg[k])}</b>
                </div>
                <div className="dx-track">
                  <i
                    style={{
                      width: Math.max(4, (catAgg[k] / mx) * 100) + "%",
                    }}
                  />
                </div>
              </div>
            );
          })
      )}
    </div>
  );
}