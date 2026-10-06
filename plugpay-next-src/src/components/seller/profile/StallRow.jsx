"use client";

import { useState } from "react";
import { usePlugPay } from "@/store/context";

export function StallRow() {
  var pp = usePlugPay();
  var cur = pp.stallAssignment;
  var BLD = ["Anniversary Towers", "Lonrho House", "Kencom House", "Odeon Cinema Bldg", "Other"];
  var _e = useState(false),
    editing = _e[0],
    setEditing = _e[1];
  var _b = useState(cur.building),
    b = _b[0],
    setB = _b[1];
  var _o = useState(""),
    other = _o[0],
    setOther = _o[1];
  var _l = useState(cur.loc),
    loc = _l[0],
    setLoc = _l[1];
  function start() {
    var known = BLD.indexOf(cur.building) > -1;
    setB(known ? cur.building : "Other");
    setOther(known ? "" : cur.building);
    setLoc(cur.loc);
    setEditing(true);
  }
  function save() {
    var name = b === "Other" ? other.trim() : b;
    if (!name || !loc.trim()) {
      pp.showToast("Enter the building and stall");
      return;
    }
    pp.changeStall(name, loc.trim());
    setEditing(false);
    pp.showToast("Stall / building updated \u2713");
  }
  return (
    <div
      className="tp-info-row"
      style={{
        border: "none",
      }}
    >
      <div
        className="tp-info-ico"
        style={{
          background: "#e3f2fd",
        }}
      >
        <span>{"\uD83C\uDFE2"}</span>
      </div>
      <div
        className="tp-info-text"
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div className="tp-info-label">STALL / BUILDING</div>
        {editing ? (
          <div>
            <select
              className="plc-input"
              style={{
                marginTop: 6,
              }}
              value={b}
              onChange={function (e) {
                setB(e.target.value);
              }}
            >
              {BLD.map(function (o) {
                return (
                  <option key={o} value={o}>
                    {o}
                  </option>
                );
              })}
            </select>
            {b === "Other" && (
              <input
                className="plc-input"
                style={{
                  marginTop: 6,
                }}
                placeholder="Building name"
                value={other}
                onChange={function (e) {
                  setOther(e.target.value);
                }}
              />
            )}
            <input
              className="plc-input"
              style={{
                marginTop: 6,
              }}
              placeholder="Floor & stall (e.g. Floor 3, Stall 14)"
              value={loc}
              onChange={function (e) {
                setLoc(e.target.value);
              }}
            />
            <div className="sp-edit-actions">
              <button className="sp-edit-btn on" onClick={save}>
                Save
              </button>
              <button
                className="sp-edit-btn"
                onClick={function () {
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="tp-info-val">{cur.building + ", " + cur.loc}</div>
        )}
      </div>
      {!editing && (
        <button className="sp-edit-btn" onClick={start}>
          {"\u270F\uFE0F Edit"}
        </button>
      )}
    </div>
  );
}