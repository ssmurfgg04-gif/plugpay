"use client";

import { useContext } from "react";
import { DashCtx } from "@/lib/seller";

export function SellerDashboardTabSection7() {
  var __c = useContext(DashCtx) || {};
  var demo = __c.demo;
  return (
    demo && (
      <div className="dx-note">Showing sample data. Record a sale and your real numbers appear here.</div>
    )
  );
}