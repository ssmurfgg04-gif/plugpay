"use client";

import { navigate } from "@/lib/nav";
import { usePlugPay } from "@/store/context";
import { Ic } from "@/components/ui/Ic";

/* ---- Dashboard tab ---- */
/* ---- Dashboard tab ---- */
export function SellerReviewsCard() {
  var pp = usePlugPay();
  var st = pp.sellerStats;
  return (
    <div
      className="tp-card"
      style={{
        padding: 14,
      }}
    >
      <div className="tp-section-title">Buyer reviews</div>
      <div className="review-summary-row">
        <strong>{st.avg.toFixed(1)}</strong>
        <span>{"\u2605"}</span>
        <span>{st.reviewCount + " reviews"}</span>
      </div>
      <button
        type="button"
        className="pp-btn secondary"
        onClick={function () {
          navigate("/seller/reviews", {
            replace: true,
          });
        }}
      >
        {Ic("star", 14)}View reviews
      </button>
    </div>
  );
}