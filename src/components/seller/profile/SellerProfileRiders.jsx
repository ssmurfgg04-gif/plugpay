"use client";

import { useSellerProfileForm } from "@/lib/seller";

export function SellerProfileRiders() {
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
      <div className="tp-section-title">Trusted Riders & Errand People</div>
      <div
        className="tp-section-body"
        style={{
          marginBottom: 10,
        }}
      >
        People you've personally worked with and vouch for.
      </div>
      <div className="vouch-list">
        {[
          ["Brian Otieno", "Boda rider", "\uD83C\uDFCD\uFE0F", "#185FA5"],
          ["Faith Nekesa", "Errand runner", "\uD83C\uDFC3", "#BA7517"],
        ].map(function (r) {
          return (
            <div key={r[0]} className="vouch-item">
              <div
                className="vouch-av"
                style={{
                  background: r[3],
                }}
              >
                {r[2]}
              </div>
              <div className="vouch-info">
                <div className="vouch-name">{r[0]}</div>
                <div className="vouch-sub">{r[1] + " \u00b7 Added by you"}</div>
              </div>
              <span className="tp-info-label">{"\u2713 Trusted"}</span>
            </div>
          );
        })}
        {pp.riders.map(function (r, i) {
          return (
            <div key={"n" + i} className="vouch-item">
              <div
                className="vouch-av"
                style={{
                  background: "#51104a",
                }}
              >
                {r.role === "Errand runner" ? "\uD83C\uDFC3" : "\uD83C\uDFCD\uFE0F"}
              </div>
              <div className="vouch-info">
                <div className="vouch-name">{r.name}</div>
                <div className="vouch-sub">{r.role + " \u00b7 Added by you"}</div>
              </div>
              <button
                className="sp-edit-btn"
                onClick={function () {
                  pp.removeRider(i);
                }}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
      <div
        className="sp-lock-note"
        style={{
          marginTop: 12,
        }}
      >
        Add a rider
      </div>
      <div className="sp-rider-form">
        <input
          className="plc-input"
          placeholder="Name"
          value={pp.riderRows[0].name}
          onChange={function (e) {
            pp.updateRiderRow(pp.riderRows[0].id, {
              name: e.target.value,
            });
          }}
        />
        <input
          className="plc-input"
          placeholder="Phone"
          value={pp.riderRows[0].phone}
          onChange={function (e) {
            pp.updateRiderRow(pp.riderRows[0].id, {
              phone: e.target.value,
            });
          }}
        />
        <select
          className="plc-input"
          value={pp.riderRows[0].role}
          onChange={function (e) {
            pp.updateRiderRow(pp.riderRows[0].id, {
              role: e.target.value,
            });
          }}
        >
          <option>Boda rider</option>
          <option>Errand runner</option>
        </select>
        <button className="sp-edit-btn on" onClick={pp.saveTrustedRiders}>
          {"+ Add"}
        </button>
      </div>
    </div>
  );
}