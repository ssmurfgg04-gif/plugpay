"use client";

import { useSellerProfileForm } from "@/lib/seller";

/* ---- Profile tab ---- */
/* ---- Profile tab ---- */
var docFields = [
  {
    key: "idfront",
    name: "ID Front",
    icon: "\u{1FAAA}",
  },
  {
    key: "idback",
    name: "ID Back",
    icon: "\u{1FAAA}",
  },
  {
    key: "selfie",
    name: "Selfie",
    icon: "\u{1F933}",
  },
  {
    key: "biz",
    name: "Business License",
    icon: "\u{1F4C4}",
  },
  {
    key: "kra",
    name: "KRA PIN Certificate",
    icon: "\u{1F9FE}",
  },
];

export function SellerProfileCompliance() {
  var f = useSellerProfileForm(),
    pp = f.pp,
    sp = f.sp,
    S = f.S,
    pm = f.pm,
    PMETHODS = f.PMETHODS,
    noAcct = f.noAcct,
    YEARS = f.YEARS;
  return (
    <div
      className="tp-card"
      style={{
        padding: 13,
      }}
    >
      <div className="tp-section-title">Compliance Documents</div>
      <div
        className="tp-section-body"
        style={{
          marginBottom: 10,
        }}
      >
        {
          "Kept on file for your own records \u2014 your landlord doesn\u2019t review these. Your Landlord Verified badge comes from your landlord confirming you occupy your stall."
        }
      </div>
      {docFields.map(function (d, i) {
        var st = pp.docStatus[d.key];
        return (
          <div key={d.key} className="sp-doc-row">
            <div
              style={{
                flex: 1,
              }}
            >
              <div className="tp-doc-label">{(d.icon || "") + " " + d.name}</div>
              <div
                className="tp-doc-badge"
                style={{
                  marginTop: 4,
                }}
              >
                {st === "done" ? "\u2713 Uploaded" : st === "uploading" ? "Uploading\u2026" : "Not uploaded"}
              </div>
            </div>
            <button
              className="sp-edit-btn"
              onClick={function () {
                pp.fakeUpload(d.key, d.name);
              }}
            >
              {st === "done" ? "Replace" : "Upload"}
            </button>
          </div>
        );
      })}
    </div>
  );
}