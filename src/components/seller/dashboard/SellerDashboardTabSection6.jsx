"use client";

import { useContext } from "react";
import { Link } from "@/components/ui/Link";
import { DashCtx } from "@/lib/seller";

export function SellerDashboardTabSection6() {
  var __c = useContext(DashCtx) || {};
  var pp = __c.pp,
    k = __c.k,
    i = __c.i,
    stock = __c.stock,
    stockMax = __c.stockMax,
    lowCount = __c.lowCount;
  return (
    <div className="dx-card">
      <div className="dx-head">
        <div
          className="dx-k"
          style={{
            margin: 0,
          }}
        >
          Stock levels
        </div>
        <span className={"dx-chip " + (lowCount ? "warn" : "ok")}>
          {lowCount ? lowCount + " need restock" : "All healthy"}
        </span>
      </div>
      {stock.map(function (c) {
        var st = c.stock === 0 ? "out" : c.stock <= 5 ? "low" : "ok";
        return (
          <div key={c.id} className="dx-row">
            <div className="dx-rowtop">
              <span className="dx-name">{c.name}</span>
              <span className={"dx-st " + st}>{c.stock === 0 ? "Out of stock" : c.stock + " left"}</span>
            </div>
            <div className="dx-track">
              <i
                className={st}
                style={{
                  width: Math.max(3, (c.stock / stockMax) * 100) + "%",
                }}
              />
            </div>
          </div>
        );
      })}
      <div className="dx-btns">
        <Link to="/seller/catalogue" className="bd-btn fill">
          <span>Manage catalogue</span>
          <span className="a">{"\u2192"}</span>
        </Link>
        <button
          className="bd-btn pill"
          onClick={function () {
            pp.openBuildingModal(pp.stallAssignment && pp.stallAssignment.building);
          }}
        >
          <span>View building</span>
          <span className="a">{"\u2192"}</span>
        </button>
      </div>
    </div>
  );
}