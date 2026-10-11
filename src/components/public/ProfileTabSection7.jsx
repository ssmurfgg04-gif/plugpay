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
          People you've personally worked with and vouch for.
        </div>
        <div className="vouch-list">
          {(!riders || riders.length === 0) && (
            <small className="sp-vouch-empty">No riders added yet. Add them from your seller profile.</small>
          )}
          {(riders || []).map((r, i) => (
            <div className="vouch-item" key={"r" + i}>
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
                  {" \xB7 Added by you"}
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
