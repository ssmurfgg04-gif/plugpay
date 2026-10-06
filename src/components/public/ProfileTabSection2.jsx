"use client";

import { useContext } from "react";
import { ProfCtx } from "@/lib/public";

export function ProfileTabSection2() {
  var __c = useContext(ProfCtx) || {};
  var showToast = __c.showToast,
    sellerProfile = __c.sellerProfile;
  return (
    <div
      className="tp-card"
      style={{
        margin: "9px 9px 0",
        padding: "13px",
      }}
    >
      <div className="tp-section-title">Social Media</div>
      <div className="tp-social-list">
        <div className="tp-social-row" onClick={() => showToast("Opening WhatsApp\u2026")}>
          <span
            className="tp-social-ico"
            style={{
              background: "#25D36622",
              color: "#1a8a4a",
            }}
          >
            {"\u{1F4AC}"}
          </span>
          <span className="tp-social-handle">{sellerProfile.whatsapp}</span>
        </div>
        <div className="tp-social-row" onClick={() => showToast("Opening Instagram\u2026")}>
          <span
            className="tp-social-ico"
            style={{
              background: "#f58529",
              color: "#fff",
            }}
          >
            {"\u{1F4F7}"}
          </span>
          <span className="tp-social-handle">{sellerProfile.instagram}</span>
        </div>
        <div className="tp-social-row" onClick={() => showToast("Opening TikTok\u2026")}>
          <span
            className="tp-social-ico"
            style={{
              background: "#00000014",
              color: "#000",
            }}
          >
            {"\u{1F3B5}"}
          </span>
          <span className="tp-social-handle">{sellerProfile.tiktok}</span>
        </div>
        <div className="tp-social-row" onClick={() => showToast("Opening Facebook\u2026")}>
          <span
            className="tp-social-ico"
            style={{
              background: "#1877F222",
              color: "#1877F2",
            }}
          >
            {"f"}
          </span>
          <span className="tp-social-handle">{sellerProfile.facebook}</span>
        </div>
      </div>
    </div>
  );
}