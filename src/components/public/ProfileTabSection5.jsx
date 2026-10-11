"use client";

import { useContext } from "react";
import { ProfCtx } from "@/lib/public";

export function ProfileTabSection5() {
  var __c = useContext(ProfCtx) || {};
  var sv = __c.sv,
    docStatus = __c.docStatus || {};
  // Documents live in the seller's compliance checklist. Show the real upload
  // state for the owner; other sellers' documents are never claimed verified.
  var ownBadge = function (key) {
    var st = docStatus[key];
    if (st === "done") return "\u2713 Uploaded";
    if (st === "uploading") return "Uploading\u2026";
    return "Not uploaded";
  };
  var otherBadge = sv.pending ? "\u23F3 Pending" : "\u2713 Verified by landlord";
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
          <div className="tp-doc-badge">{sv.own ? ownBadge("idfront") : otherBadge}</div>
        </div>
        <div className="tp-doc-item">
          <div className="tp-doc-label">ID BACK</div>
          <div className="tp-doc-badge">{sv.own ? ownBadge("idback") : otherBadge}</div>
        </div>
      </div>
      <div className="tp-doc-item tp-doc-wide">
        <div className="tp-doc-label">BUSINESS LICENSE</div>
        <div className="tp-doc-badge">{sv.own ? ownBadge("biz") : otherBadge}</div>
      </div>
    </div>
  );
}
