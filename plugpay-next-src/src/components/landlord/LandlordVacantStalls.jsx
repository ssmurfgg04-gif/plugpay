"use client";

import { usePlugPay } from "@/store/context";

export function LandlordVacantStalls() {
  var pp = usePlugPay();
  var vacant = pp.vacantStalls || [];
  return (
    <section className="ll-status-card">
      <div className="ll-section-title">Unoccupied stalls</div>
      <div className="ll-section-sub">Available stalls ready for admission.</div>
      {vacant.map(function (stall) {
        return (
          <div className="ll-seller-row" key={stall.id}>
            <div className="ll-seller-avatar vacant">{"+"}</div>
            <div className="ll-seller-info">
              <strong>{stall.id}</strong>
              <span>{stall.label}</span>
            </div>
            <button
              className="sp-edit-btn on"
              onClick={function () {
                pp.llOpenAdmitSeller(stall.id, stall.label);
              }}
            >
              Admit seller
            </button>
          </div>
        );
      })}
      {vacant.length === 0 && <div className="ll-empty">No vacant stalls right now.</div>}
    </section>
  );
}