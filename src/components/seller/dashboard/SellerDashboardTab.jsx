"use client";

import { useState } from "react";
import { usePlugPay } from "@/store/context";
import { DashCtx } from "@/lib/seller";
import { SellerDashboardTabSection1 } from "@/components/seller/dashboard/SellerDashboardTabSection1";
import { SellerDashboardTabSection2 } from "@/components/seller/dashboard/SellerDashboardTabSection2";
import { SellerDashboardTabSection3 } from "@/components/seller/dashboard/SellerDashboardTabSection3";
import { SellerDashboardTabSection4 } from "@/components/seller/dashboard/SellerDashboardTabSection4";
import { SellerDashboardTabSection5 } from "@/components/seller/dashboard/SellerDashboardTabSection5";
import { SellerDashboardTabSection6 } from "@/components/seller/dashboard/SellerDashboardTabSection6";
import { SellerDashboardVouches } from "@/components/seller/dashboard/SellerDashboardVouches";
import { SellerDashboardTabSection7 } from "@/components/seller/dashboard/SellerDashboardTabSection7";

export function SellerDashboardTab() {
  var pp = usePlugPay();
  var _m = useState("daily"),
    mode = _m[0],
    setMode = _m[1];
  var cat = pp.catalogueItems;
  var money = function (n) {
    return "KSh " + Math.round(n).toLocaleString();
  };
  var rows = [];
  pp.sentReceipts.forEach(function (r) {
    (r.items || []).forEach(function (it) {
      rows.push({
        name: it.name,
        amt: Number(it.price) || 0,
        qty: Number(it.qty) || 1,
        cat: it.category || (it.productId ? "" : "Not in catalogue"),
        at: new Date(r.createdAt),
      });
    });
  });
  var demo = rows.length === 0;
  if (demo && cat.length) {
    var seed = 7,
      rnd = function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    for (var d = 0; d < 800; d++) {
      var n = 1 + Math.floor(rnd() * 4);
      for (var k = 0; k < n; k++) {
        var p = cat[Math.floor(rnd() * rnd() * cat.length)];
        var dt = new Date();
        dt.setHours(9 + Math.floor(rnd() * 9), 0, 0, 0);
        dt.setDate(dt.getDate() - d);
        rows.push({
          name: p.name,
          amt: Number(p.price) || 0,
          qty: 1,
          cat: p.category,
          at: dt,
        });
      }
    }
  }
  var DAY = 86400000,
    i,
    now = new Date();
  now.setHours(0, 0, 0, 0);
  var addD = function (d0, n) {
    var x = new Date(d0);
    x.setDate(x.getDate() + n);
    return x;
  };
  var wkStart = addD(now, -((now.getDay() + 6) % 7));
  var DN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var starts = [],
    ends = [],
    labels = [],
    prevStart,
    prevEnd,
    yr = now.getFullYear();
  if (mode === "daily") {
    for (i = 0; i < 7; i++) {
      starts.push(addD(wkStart, i).getTime());
      ends.push(addD(wkStart, i + 1).getTime());
      labels.push(DN[i]);
    }
    prevStart = addD(wkStart, -7).getTime();
    prevEnd = wkStart.getTime();
  } else if (mode === "weekly") {
    for (i = 0; i < 6; i++) {
      var ws = addD(wkStart, (i - 5) * 7);
      starts.push(ws.getTime());
      ends.push(addD(ws, 7).getTime());
      labels.push(ws.getDate() + " " + MN[ws.getMonth()]);
    }
    prevStart = addD(wkStart, -77).getTime();
    prevEnd = starts[0];
  } else {
    for (i = 0; i < 12; i++) {
      starts.push(new Date(yr, i, 1).getTime());
      ends.push(new Date(yr, i + 1, 1).getTime());
      labels.push(MN[i]);
    }
    prevStart = new Date(yr - 1, 0, 1).getTime();
    prevEnd = starts[0];
  }
  var count = starts.length,
    nowT = Date.now();
  var series = labels.map(function (l, idx) {
    return {
      amt: 0,
      n: 0,
      label: l,
      latest: nowT >= starts[idx] && nowT < ends[idx],
    };
  });
  var catAgg = {};
  var cur = 0,
    curN = 0,
    prev = 0,
    prod = {};
  rows.forEach(function (r) {
    var t = r.at.getTime();
    if (t >= prevStart && t < prevEnd) {
      prev += r.amt;
      return;
    }
    for (var bi = 0; bi < count; bi++) {
      if (t >= starts[bi] && t < ends[bi]) {
        series[bi].amt += r.amt;
        series[bi].n += r.qty || 1;
        cur += r.amt;
        curN += r.qty || 1;
        var q =
          prod[r.name] ||
          (prod[r.name] = {
            name: r.name,
            units: 0,
            amt: 0,
          });
        q.units += r.qty || 1;
        q.amt += r.amt;
        var ck = r.cat || "General";
        catAgg[ck] = (catAgg[ck] || 0) + r.amt;
        break;
      }
    }
  });
  var maxAmt = Math.max.apply(
    null,
    series
      .map(function (s) {
        return s.amt;
      })
      .concat([1]),
  );
  var delta = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null;
  var top = Object.keys(prod)
    .map(function (k) {
      return prod[k];
    })
    .sort(function (a, b) {
      return b.amt - a.amt;
    })
    .slice(0, 6);
  var topMax = top.length ? top[0].amt : 1;
  var stock = cat.slice().sort(function (a, b) {
    return a.stock - b.stock;
  });
  var stockMax = Math.max.apply(
    null,
    cat
      .map(function (c) {
        return c.stock;
      })
      .concat([1]),
  );
  var lowCount = cat.filter(function (c) {
    return c.stock <= 5;
  }).length;
  var W = 320,
    H = 110,
    bw = W / count;
  var todayName = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  var __v = {
    pp: pp,
    _m: _m,
    mode: mode,
    setMode: setMode,
    cat: cat,
    money: money,
    rows: rows,
    demo: demo,
    seed: seed,
    rnd: rnd,
    d: d,
    n: n,
    k: k,
    p: p,
    dt: dt,
    DAY: DAY,
    i: i,
    now: now,
    addD: addD,
    wkStart: wkStart,
    DN: DN,
    MN: MN,
    starts: starts,
    ends: ends,
    labels: labels,
    prevStart: prevStart,
    prevEnd: prevEnd,
    yr: yr,
    ws: ws,
    count: count,
    nowT: nowT,
    series: series,
    catAgg: catAgg,
    cur: cur,
    curN: curN,
    prev: prev,
    prod: prod,
    maxAmt: maxAmt,
    delta: delta,
    top: top,
    topMax: topMax,
    stock: stock,
    stockMax: stockMax,
    lowCount: lowCount,
    W: W,
    H: H,
    bw: bw,
    todayName: todayName,
  };
  return (
    <DashCtx.Provider value={__v}>
      <div className="dx">
        <>
          <SellerDashboardTabSection1 />
          <SellerDashboardTabSection2 />
          <SellerDashboardTabSection3 />
          <SellerDashboardTabSection4 />
          <SellerDashboardTabSection5 />
          <SellerDashboardTabSection6 />
          <SellerDashboardVouches />
          <SellerDashboardTabSection7 />
        </>
      </div>
    </DashCtx.Provider>
  );
}