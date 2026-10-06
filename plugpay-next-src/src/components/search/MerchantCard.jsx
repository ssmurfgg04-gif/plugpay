"use client";

import { usePlugPay } from "@/store/context";

export function MerchantCard({ r }) {
  const { openDirectorySeller } = usePlugPay();
  return (
    <div className="res-card" onClick={() => openDirectorySeller(r)}>
      <div className="rc-top">
        <div
          className="rc-av"
          style={{
            background: r.color,
          }}
        >
          {r.initials}
        </div>
        <div className="rc-info">
          <div className="rc-name">{r.name}</div>
          <div className="rc-sub">{r.sub}</div>
          <div className={`rc-badge ${r.badgeClass}`}>{r.badge}</div>
        </div>
      </div>
      <div className="rc-stats">
        <div className="rcs">
          <div className="rcs-n">
            {r.rating}
            {"\u2605"}
          </div>
          <div className="rcs-l">Rating</div>
        </div>
        <div className="rcs">
          <div className="rcs-n">{r.sales}</div>
          <div className="rcs-l">Sales</div>
        </div>
        <div className="rcs">
          <div className="rcs-n">{r.reviews}</div>
          <div className="rcs-l">Reviews</div>
        </div>
      </div>
      <button className="rc-btn">{"View profile \u2192"}</button>
    </div>
  );
}