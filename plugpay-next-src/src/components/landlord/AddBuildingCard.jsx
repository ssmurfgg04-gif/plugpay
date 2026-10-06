"use client";

import { useState } from "react";
import { usePlugPay } from "@/store/context";

export function AddBuildingCard() {
  var pp = usePlugPay();
  var _n = useState(""),
    name = _n[0],
    setName = _n[1];
  var _s = useState(""),
    street = _s[0],
    setStreet = _s[1];
  var _t = useState(""),
    stalls = _t[0],
    setStalls = _t[1];
  return (
    <section
      className="app-card"
      style={{
        marginTop: 14,
      }}
    >
      <div className="app-card-title">Add another building</div>
      <div className="app-card-sub">
        Each building you add gets its own landlord account, separate from the others.
      </div>
      <div
        className="app-form-grid"
        style={{
          marginTop: 10,
        }}
      >
        <label className="pp-field">
          <span className="pp-label">Building name</span>
          <input
            className="pp-input"
            value={name}
            onChange={function (e) {
              setName(e.target.value);
            }}
            placeholder="e.g. Kimathi House"
          />
        </label>
        <label className="pp-field">
          <span className="pp-label">Street / area</span>
          <input
            className="pp-input"
            value={street}
            onChange={function (e) {
              setStreet(e.target.value);
            }}
            placeholder="e.g. Kimathi St"
          />
        </label>
        <label className="pp-field">
          <span className="pp-label">Total stalls</span>
          <input
            className="pp-input"
            type="number"
            value={stalls}
            onChange={function (e) {
              setStalls(e.target.value);
            }}
            placeholder="e.g. 40"
          />
        </label>
      </div>
      <div className="app-actions">
        <button
          className="pp-btn primary"
          onClick={function () {
            if (pp.llAddBuilding(name, street, stalls)) {
              setName("");
              setStreet("");
              setStalls("");
            }
          }}
        >
          Create building account
        </button>
      </div>
    </section>
  );
}