"use client";

import { usePlugPay } from "@/store/context";
import { BuildingViewContainer } from "@/components/building/BuildingViewContainer";

export function LandlordBuildingView() {
  var pp = usePlugPay();
  return (
    <div
      className="ll-building-view"
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "#fff",
        marginBottom: 14,
      }}
    >
      <BuildingViewContainer id={pp.lbActive.name} landlord={true} />
    </div>
  );
}