"use client";

import { useSellerProfileForm } from "@/lib/seller";

export function SellerProfileRelocate() {
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
        marginBottom: 30,
      }}
    >
      <div className="tp-section-title">Relocate stall</div>
      <div
        className="tp-section-body"
        style={{
          marginBottom: 10,
        }}
      >
        Moving buildings? Submit the new stall for landlord verification.
      </div>
      <div className="sp-rider-form">
        <input
          className="plc-input"
          placeholder="New building"
          value={pp.vacateBuilding}
          onChange={function (e) {
            pp.setVacateBuilding(e.target.value);
          }}
        />
        <input
          className="plc-input"
          placeholder="New stall (e.g. Floor 2, Stall 9)"
          value={pp.vacateStall}
          onChange={function (e) {
            pp.setVacateStall(e.target.value);
          }}
        />
        <button className="sp-edit-btn on" onClick={pp.confirmVacate}>
          Submit
        </button>
      </div>
    </div>
  );
}