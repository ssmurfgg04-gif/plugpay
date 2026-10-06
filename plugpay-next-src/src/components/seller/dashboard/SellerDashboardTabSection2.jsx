"use client";

import { useContext } from "react";
import { DashCtx } from "@/lib/seller";

export function SellerDashboardTabSection2() {
  var __c = useContext(DashCtx) || {};
  var mode = __c.mode,
    money = __c.money,
    n = __c.n,
    k = __c.k,
    now = __c.now,
    yr = __c.yr,
    series = __c.series,
    cur = __c.cur,
    curN = __c.curN,
    maxAmt = __c.maxAmt,
    delta = __c.delta,
    W = __c.W,
    H = __c.H,
    bw = __c.bw;
  return (
    <div className="dx-card">
      <div className="dx-k">
        {mode === "daily"
          ? "Sales \u00b7 this week (Mon\u2013Sun)"
          : mode === "weekly"
            ? "Sales \u00b7 last 6 weeks"
            : "Sales \u00b7 " + yr + " by month"}
      </div>
      <div className="dx-big">{money(cur)}</div>
      {delta !== null && (
        <div className={"dx-delta " + (delta >= 0 ? "up" : "down")}>
          {(delta >= 0 ? "\u2191 " : "\u2193 ") + Math.abs(delta) + "% vs previous period"}
        </div>
      )}
      <svg className="dx-chart" viewBox={"0 0 " + W + " " + (H + 18)} preserveAspectRatio="none">
        {series.map(function (s, j) {
          var bh = Math.max(2, (s.amt / maxAmt) * H);
          return (
            <g key={j}>
              <rect
                className={"dx-bar" + (s.latest ? " now" : "")}
                x={j * bw + bw * 0.2}
                y={H - bh}
                width={bw * 0.6}
                height={bh}
                rx={3}
              />
              <text className="dx-lbl" x={j * bw + bw / 2} y={H + 13} textAnchor="middle">
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="dx-mini">
        <div>
          <b>{curN}</b>
          <span>Items sold</span>
        </div>
        <div>
          <b>{money(curN ? cur / curN : 0)}</b>
          <span>Avg. sale</span>
        </div>
        <div>
          <b>
            {
              (
                series.filter(function (x) {
                  return x.latest;
                })[0] || {
                  n: 0,
                }
              ).n
            }
          </b>
          <span>{mode === "daily" ? "Today" : mode === "weekly" ? "This week" : "This month"}</span>
        </div>
      </div>
    </div>
  );
}