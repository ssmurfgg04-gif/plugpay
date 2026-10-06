"use client";

import { useContext } from "react";
import { ProfCtx } from "@/lib/public";

export function ProfileTabSection1() {
  var __c = useContext(ProfCtx) || {};
  var sellerProfile = __c.sellerProfile;
  return (
    <div
      className="tp-card tp-info-card"
      style={{
        margin: "9px 9px 0",
      }}
    >
      <div className="tp-info-row">
        <div
          className="tp-info-ico"
          style={{
            background: "#fff8e1",
          }}
        >
          <span>{"\u{1F4CD}"}</span>
        </div>
        <div className="tp-info-text">
          <div className="tp-info-label">LOCATION</div>
          <div className="tp-info-val">{sellerProfile.street}</div>
        </div>
      </div>
      <div className="tp-info-row">
        <div
          className="tp-info-ico"
          style={{
            background: "#f8f1f7",
          }}
        >
          <span>{"\u{1F4DE}"}</span>
        </div>
        <div className="tp-info-text">
          <div className="tp-info-label">PHONE</div>
          <div className="tp-info-val">{sellerProfile.phone}</div>
        </div>
      </div>
      <div
        className="tp-info-row"
        style={{
          border: "none",
        }}
      >
        <div
          className="tp-info-ico"
          style={{
            background: "#ede7f6",
          }}
        >
          <span>{"\u{1F4C5}"}</span>
        </div>
        <div className="tp-info-text">
          <div className="tp-info-label">ESTABLISHED</div>
          <div className="tp-info-val">{sellerProfile.established}</div>
        </div>
      </div>
    </div>
  );
}