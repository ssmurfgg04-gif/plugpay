"use client";

import { usePlugPay } from "@/store/context";
import { floorLabel } from "@/lib/shared";

export function ObReview() {
  var pp = usePlugPay();
  var list = pp.obMerchantList;
  return (
    <>
      <div className="ob-section-divider">{"\u2705 Ready to publish"}</div>
      <div className="ob-summary-card">
        <div className="ob-summary-row">
          <span className="ob-summary-label">Building</span>
          <span className="ob-summary-val">
            {(pp.obBldgName || "\u2014") +
              " \u00b7 " +
              (pp.obFloorsCount || "\u2014") +
              " floors \u00b7 " +
              pp.obTotalStalls +
              " stalls"}
          </span>
        </div>
        <div className="ob-summary-row">
          <span className="ob-summary-label">Sellers registered</span>
          <span className="ob-summary-val">{list.length}</span>
        </div>
      </div>
      {list.length > 0 && (
        <div
          className="ob-merchant-list"
          style={{
            marginTop: 10,
          }}
        >
          {list.map(function (m) {
            return (
              <div key={m.id} className="ob-merchant-row">
                <div
                  className="ob-merchant-av"
                  style={{
                    background: m.color,
                  }}
                >
                  {m.initials}
                </div>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div className="ob-merchant-name">{m.biz}</div>
                  <div className="ob-merchant-stall">
                    {floorLabel(m.floor) + ", Stall " + m.stallNum + " \u00b7 " + m.type}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          fontSize: 11,
          color: "var(--muted)",
          fontFamily: "var(--fm)",
        }}
      >
        {"Or send a self-registration link: "}
        <strong
          style={{
            color: "var(--accent)",
          }}
        >
          plug.pay/join/anniversary-towers
        </strong>
      </div>
      <div
        className="ob-doc-note"
        style={{
          marginTop: 10,
        }}
      >
        {
          "\u26A1 Publishing goes live for every seller above at once. Buyers can then search this building and see all registered merchants."
        }
      </div>
    </>
  );
}