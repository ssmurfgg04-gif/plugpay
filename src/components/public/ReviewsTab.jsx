"use client";

import { usePlugPay } from "@/store/context";
import { useSV } from "@/lib/public";
import { initials, relTime } from "@/lib/shared";

var REVIEWS = [
  {
    initials: "JK",
    bg: "#1e3a5f",
    fg: "#60a5fa",
    name: "James Kamau",
    date: "2 days ago",
    stars: 5,
    text: "Bought a Samsung Galaxy. Genuine product, great price. Comes with 30-day warranty as promised. Fast delivery too.",
    receipt: "#01201",
  },
  {
    initials: "FO",
    bg: "#380b33",
    fg: "#e557d6",
    name: "Faith Otieno",
    date: "1 week ago",
    stars: 5,
    text: "Best electronics shop in Moi Avenue. Honest seller, original products. Will definitely come back.",
    receipt: "#01187",
  },
  {
    initials: "BN",
    bg: "#3c1f6e",
    fg: "#a78bfa",
    name: "Brian Njoroge",
    date: "2 weeks ago",
    stars: 4,
    text: "Good laptop at fair price. Would have preferred original box but overall happy with the purchase.",
    receipt: "#01156",
  },
];

export function ReviewsTab() {
  var pp = usePlugPay();
  var sv = useSV();
  var st = sv.stats;
  var fresh = sv.reviews.map(function (r) {
    return {
      initials: initials(r.buyerName || "Buyer"),
      bg: "#380b33",
      fg: "#e557d6",
      name: r.buyerName || "Verified buyer",
      date: relTime(r.at),
      stars: r.rating,
      text: r.comment || "Left a star rating.",
      receipt: r.code,
    };
  });
  var list = sv.own ? fresh.concat(REVIEWS) : REVIEWS.slice(0, Math.min(REVIEWS.length, st.reviewCount));
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
              pct = Math.round((c / st.reviewCount) * 100);
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
              <div className="rev-verified">{"\u2713 Verified buyer \u00b7 Receipt " + r.receipt}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}