"use client";

import { useContext } from "react";
import { ProfCtx } from "@/lib/public";

export function ProfileTabSection3() {
  var __c = useContext(ProfCtx) || {};
  var showToast = __c.showToast,
    copyText = __c.copyText,
    sellerProfile = __c.sellerProfile;
  return (
    sellerProfile.paybill && (
      <div
        className="tp-card tp-pay-info-card"
        style={{
          margin: "9px 9px 0",
        }}
      >
        <div className="tp-pay-info-header">
          <div className="tp-pay-info-title">
            <span className="tp-pay-info-icon">{"\u{1F4B3}"}</span>
            {" Payment Information"}
          </div>
          <div className="tp-pay-info-badge">M-Pesa</div>
        </div>
        <div className="tp-pay-info-rows">
          <div className="tp-pay-info-row">
            <div
              className="tp-pay-info-ico"
              style={{
                background: "#f8f1f7",
              }}
            >
              {"\u{1F3E6}"}
            </div>
            <div className="tp-pay-info-text">
              <div className="tp-pay-info-label">PAYBILL NUMBER</div>
              <div className="tp-pay-info-val">{sellerProfile.paybill}</div>
            </div>
            <button
              className="tp-copy-btn"
              onClick={() => copyText(sellerProfile.paybill, "Paybill copied!")}
            >
              <span>Copy</span>
            </button>
          </div>
          <div
            className="tp-pay-info-row"
            style={{
              border: "none",
            }}
          >
            <div
              className="tp-pay-info-ico"
              style={{
                background: "#e3f2fd",
              }}
            >
              {"\u{1F522}"}
            </div>
            <div className="tp-pay-info-text">
              <div className="tp-pay-info-label">ACCOUNT NUMBER</div>
              <div className="tp-pay-info-val">{sellerProfile.account}</div>
            </div>
            <button
              className="tp-copy-btn"
              onClick={() => copyText(sellerProfile.account, "Account copied!")}
            >
              <span>Copy</span>
            </button>
          </div>
        </div>
        <button
          className="tp-pay-now-btn"
          onClick={() => showToast("Opening M-Pesa payment for " + sellerProfile.bizName + "\u2026")}
        >
          <span>Pay via M-Pesa</span>
          <span className="tp-pay-arrow">{"\u2192"}</span>
        </button>
        <div className="tp-pay-note">
          {"Send to Paybill "}
          <strong>{sellerProfile.paybill}</strong>
          {", Account "}
          <strong>{sellerProfile.account}</strong>
          {", then ask the seller for your receipt."}
        </div>
      </div>
    )
  );
}