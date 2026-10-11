"use client";

import { usePlugPay } from "@/store/context";
import { useSV } from "@/lib/public";
import { initials, relTime } from "@/lib/shared";

export function ReviewsTab() {
  var pp = usePlugPay();
  var sv = useSV();
  var st = sv.stats;
  // Real reviews only: own profile lists receipt-anchored reviews from actual
  // sales; viewed sellers show database reviews hydrated from
  // /api/public/seller/[slug]. Empty means empty — no seeded sample reviews.
  var list = sv.reviews.map(function (r) {
    return {
      initials: initials(r.buyerName || "Buyer"),
      bg: "#380b33",
      fg: "#e557d6",
      name: r.buyerName || "Verified buyer",
      date: relTime(r.at),
      stars: r.rating,
      text: r.comment || "Left a star rating.",
      receipt: r.code || r.receiptNo || "",
    };
  });
  var rounded = Math.round(st.avg);
  return (
    <div
      className="modal-tab-body on"
      style={{
        padding: "12px",
      }}
    >
      <div className="rev-summary">
        <div
          style={{
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <div className="rev-big-num">{st.avg.toFixed(1)}</div>
          <div className="rev-stars-big">{"\u2605".repeat(rounded) + "\u2606".repeat(5 - rounded)}</div>
          <div className="rev-sub">{st.reviewCount + " reviews"}</div>
        </div>
        <div className="rev-bars">
          {[5, 4, 3, 2, 1].map(function (n) {
            var c = st.dist[n] || 0,
              pct = st.reviewCount > 0 ? Math.round((c / st.reviewCount) * 100) : 0;
            return (
              <div className="rev-bar-row" key={n}>
                <span className="rev-bar-lbl">{n}</span>
                <div className="rev-bar-track">
                  <div
                    className="rev-bar-fill"
                    style={{
                      width: pct + "%",
                    }}
                  />
                </div>
                <span className="rev-bar-ct">{c}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rev-list">
        {list.length === 0 && (
          <small className="sp-vouch-empty" style={{ padding: "12px 4px", display: "block" }}>
            No reviews yet. Reviews come from real buyers with a receipt number.
          </small>
        )}
        {list.map(function (r) {
          return (
            <div className="rev-item" key={r.name + r.receipt}>
              <div className="rev-item-top">
                <div
                  className="rev-item-av"
                  style={{
                    background: r.bg,
                    color: r.fg,
                  }}
                >
                  {r.initials}
                </div>
                <div>
                  <div className="rev-item-name">{r.name}</div>
                  <div className="rev-item-date">{r.date}</div>
                </div>
                <div className="rev-item-stars">
                  {"\u2605".repeat(r.stars)}
                  {r.stars < 5 && (
                    <span
                      style={{
                        color: "#ccc",
                      }}
                    >
                      {"\u2605".repeat(5 - r.stars)}
                    </span>
                  )}
                </div>
              </div>
              <div className="rev-item-text">{r.text}</div>
              {r.receipt ? (
                <div className="rev-verified">{"\u2713 Verified buyer \u00b7 Receipt " + r.receipt}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}