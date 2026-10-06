"use client";

import { usePlugPay } from "@/store/context";

export function LandlordVacatedList() {
  var pp = usePlugPay();
  return (
    <section className="ll-status-card">
      <div className="ll-section-title">Recently vacated</div>
      <div className="ll-section-sub">Seller history remains attached to the seller.</div>
      {pp.vacatedTraders.map(function (seller) {
        return (
          <div className="ll-seller-row muted" key={seller.id}>
            <div className="ll-seller-avatar">{"\u2713"}</div>
            <div className="ll-seller-info">
              <strong>{seller.name}</strong>
              <span>{seller.sub}</span>
            </div>
            <span className="pp-status">VACATED</span>
          </div>
        );
      })}
    </section>
  );
}