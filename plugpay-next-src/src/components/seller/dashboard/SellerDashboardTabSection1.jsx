"use client";

import { useContext } from "react";
import { DashCtx } from "@/lib/seller";

export function SellerDashboardTabSection1() {
  var __c = useContext(DashCtx) || {};
  var mode = __c.mode,
    setMode = __c.setMode,
    top = __c.top,
    todayName = __c.todayName;
  return (
    <div className="dx-top">
      <div>
        <div className="dx-date">{todayName}</div>
        <div className="dx-h">Overview</div>
      </div>
      <div className="dx-seg">
        {["daily", "weekly", "yearly"].map(function (m) {
          return (
            <button
              key={m}
              className={mode === m ? "on" : ""}
              onClick={function () {
                setMode(m);
              }}
            >
              {m === "daily" ? "Daily" : m === "weekly" ? "Weekly" : "Yearly"}
            </button>
          );
        })}
      </div>
    </div>
  );
}