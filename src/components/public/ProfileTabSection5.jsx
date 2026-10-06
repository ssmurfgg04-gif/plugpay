"use client";

import { useContext } from "react";
import { ProfCtx } from "@/lib/public";

export function ProfileTabSection5() {
  var __c = useContext(ProfCtx) || {};
  var sv = __c.sv;
  return (
    <div
      className="tp-card"
      style={{
        margin: "9px 9px 9px",
        padding: "13px",
      }}
    >
      <div className="tp-section-title">Verification Documents</div>
      <div className="tp-docs-grid">
        <div className="tp-doc-item">
          <div className="tp-doc-label">ID FRONT</div>
          <div className="tp-doc-badge">{sv.own || !sv.pending ? "\u2713 Verified" : "\u23F3 Pending"}</div>
        </div>
        <div className="tp-doc-item">
          <div className="tp-doc-label">ID BACK</div>
          <div className="tp-doc-badge">{sv.own || !sv.pending ? "\u2713 Verified" : "\u23F3 Pending"}</div>
        </div>
      </div>
      <div className="tp-doc-item tp-doc-wide">
        <div className="tp-doc-label">BUSINESS LICENSE</div>
        <div className="tp-doc-badge">{sv.own || !sv.pending ? "\u2713 Verified" : "\u23F3 Pending"}</div>
      </div>
    </div>
  );
}