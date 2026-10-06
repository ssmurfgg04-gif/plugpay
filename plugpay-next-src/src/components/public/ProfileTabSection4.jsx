"use client";

import { useContext } from "react";
import { ProfCtx } from "@/lib/public";

export function ProfileTabSection4() {
  var __c = useContext(ProfCtx) || {};
  var sellerProfile = __c.sellerProfile;
  return (
    <div
      className="tp-card"
      style={{
        margin: "9px 9px 0",
        padding: "13px",
      }}
    >
      <div className="tp-section-title">About the Business</div>
      <div className="tp-section-body">{sellerProfile.about}</div>
    </div>
  );
}