"use client";

import { useState } from "react";
import { usePlugPay } from "@/store/context";

export function SellerHero(props) {
  var pp = usePlugPay();
  var sp = pp.sellerProfile;
  var _e = useState(false),
    editing = _e[0],
    setEditing = _e[1];
  var _f = useState(sp),
    form = _f[0],
    setForm = _f[1];
  function set(k, v) {
    var n = {};
    n[k] = v;
    setForm(Object.assign({}, form, n));
  }
  function save() {
    if (!form.bizName.trim()) {
      pp.showToast("Business name is required");
      return;
    }
    pp.updateSellerProfile({
      bizName: form.bizName.trim(),
      ownerName: form.ownerName.trim(),
      role: form.role.trim(),
      bio: form.bio.trim(),
      street: form.street.trim(),
    });
    setEditing(false);
  }
  return (
    <>
      <div
        className="tp-hero"
        style={{
          marginTop: 0,
        }}
      >
        {props.editable && (
          <button
            className="sp-hero-edit"
            onClick={function () {
              setForm(sp);
              setEditing(!editing);
            }}
          >
            {editing ? "\u2715 Close" : "\u270F\uFE0F Edit header"}
          </button>
        )}
        <div className="tp-hero-avatar-wrap">
          <div className="tp-hero-avatar">{(sp.bizName || "W").charAt(0).toUpperCase()}</div>
          <div className="tp-hero-av-check">{"\u2713"}</div>
        </div>
        <div className="tp-hero-name">{sp.bizName}</div>
        <div className="tp-hero-role">{sp.ownerName + " \u00b7 " + sp.role}</div>
        <div className="tp-hero-badge">
          <span className="tp-v-icon">{"\u2713"}</span>
          {" Verified Seller Profile"}
        </div>
        <div className="tp-hero-bio">{sp.bio}</div>
        <div className="tp-hero-loc">
          <span>{"\uD83D\uDCCD " + sp.street}</span>
          <span>{pp.stallAssignment.building + ", " + pp.stallAssignment.loc}</span>
        </div>
        <div className="tp-landlord-tag">
          <span className={"tp-landlord-tick" + (pp.landlordVerifyPending ? " pending" : "")}>
            {pp.landlordVerifyPending ? "\u23F3" : "\u2713"}
          </span>{" "}
          <span>{pp.landlordVerifyPending ? "Pending" : "Verified"}</span>
        </div>
        <div className="tp-hero-stats">
          <div className="tp-hero-stat">
            <div className="tp-hero-stat-n">{pp.sellerStats.sales}</div>
            <div className="tp-hero-stat-l">Sales</div>
          </div>
          <div className="tp-hero-stat">
            <div className="tp-hero-stat-n">235</div>
            <div className="tp-hero-stat-l">Followers</div>
          </div>
          <div className="tp-hero-stat">
            <div className="tp-hero-stat-n">{pp.sellerStats.reviewCount}</div>
            <div className="tp-hero-stat-l">Reviews</div>
          </div>
          <div className="tp-hero-stat">
            <div className="tp-hero-stat-n">{pp.sellerStats.trust}</div>
            <div className="tp-hero-stat-l">Trust</div>
          </div>
        </div>
      </div>
      {editing && (
        <div
          className="tp-card"
          style={{
            padding: 13,
          }}
        >
          <div className="tp-section-title">Edit header</div>
          {[
            ["bizName", "Business name"],
            ["ownerName", "Owner name"],
            ["role", "Business type / role"],
            ["street", "Street location"],
          ].map(function (f) {
            return (
              <label
                key={f[0]}
                className="plc-field"
                style={{
                  display: "block",
                  marginBottom: 10,
                }}
              >
                <span className="plc-label">{f[1]}</span>
                <input
                  className="plc-input"
                  list={f[0] === "role" ? "sp-roles" : undefined}
                  value={form[f[0]]}
                  onChange={function (e) {
                    set(f[0], e.target.value);
                  }}
                />
              </label>
            );
          })}
          <datalist id="sp-roles">
            {[
              "Electronics Retailer",
              "Fashion & Clothing",
              "Food & Groceries",
              "Hardware & Building",
              "Beauty & Cosmetics",
              "Furniture",
              "Services & Repairs",
              "Wholesaler",
            ].map(function (o) {
              return <option key={o} value={o} />;
            })}
          </datalist>
          <label
            className="plc-field"
            style={{
              display: "block",
              marginBottom: 10,
            }}
          >
            <span className="plc-label">Short bio</span>
            <textarea
              className="plc-input"
              style={{
                minHeight: 70,
              }}
              value={form.bio}
              onChange={function (e) {
                set("bio", e.target.value);
              }}
            />
          </label>
          <div className="sp-lock-note">
            {
              "\uD83D\uDD12 Verified badge, landlord verification, stall location and stats are set by PlugPay and your landlord \u2014 they can't be edited."
            }
          </div>
          <div className="sp-edit-actions">
            <button className="sp-edit-btn on" onClick={save}>
              Save changes
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
      )}
    </>
  );
}