"use client";

import { useContext } from "react";
import { ProfCtx } from "@/lib/public";

export function ProfileTabSection7() {
  var __c = useContext(ProfCtx) || {};
  var riders = __c.riders,
    sv = __c.sv;
  return (
    sv.own && (
      <div
        className="tp-card"
        style={{
          margin: "9px 9px 9px",
          padding: "13px",
        }}
      >
        <div className="tp-section-title">Trusted Riders & Errand People</div>
        <div
          className="tp-section-body"
          style={{
            marginBottom: "10px",
          }}
        >
          People this seller has personally worked with and vouches for.
        </div>
        <div className="vouch-list">
          <div className="vouch-item">
            <div
              className="vouch-av"
              style={{
                background: "#185FA5",
              }}
            >
              {"\u{1F3CD}\uFE0F"}
            </div>
            <div className="vouch-info">
              <div className="vouch-name">Brian Otieno</div>
              <div className="vouch-sub">{"Boda rider \xB7 Added by this seller"}</div>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#8b008b",
                fontFamily: "var(--fm)",
                whiteSpace: "nowrap",
              }}
            >
              {"\u2713 Trusted"}
            </span>
          </div>
          <div className="vouch-item">
            <div
              className="vouch-av"
              style={{
                background: "#BA7517",
              }}
            >
              {"\u{1F3C3}"}
            </div>
            <div className="vouch-info">
              <div className="vouch-name">Faith Nekesa</div>
              <div className="vouch-sub">{"Errand runner \xB7 Added by this seller"}</div>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#8b008b",
                fontFamily: "var(--fm)",
                whiteSpace: "nowrap",
              }}
            >
              {"\u2713 Trusted"}
            </span>
          </div>
          {riders.map((r, i) => (
            <div className="vouch-item">
              <div
                className="vouch-av"
                style={{
                  background: "#51104a",
                }}
              >
                {r.role === "Errand runner" ? "\u{1F3C3}" : "\u{1F3CD}\uFE0F"}
              </div>
              <div className="vouch-info">
                <div className="vouch-name">{r.name}</div>
                <div className="vouch-sub">
                  {r.role}
                  {" \xB7 Added by this seller"}
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#8b008b",
                  fontFamily: "var(--fm)",
                  whiteSpace: "nowrap",
                }}
              >
                {"\u2713 Trusted"}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  );
}