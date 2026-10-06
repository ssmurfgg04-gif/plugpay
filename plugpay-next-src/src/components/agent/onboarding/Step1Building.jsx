"use client";

import { usePlugPay } from "@/store/context";

export function Step1Building({ active = true }) {
  const {
    obBldgName,
    setObBldgName,
    obFloorsCount,
    setObFloorsCount,
    obFloorStalls,
    setObFloorStall,
    obTotalStalls,
  } = usePlugPay();
  const n = Math.min(30, Math.max(0, parseInt(obFloorsCount) || 0));
  const floorKeys = Array.from(
    {
      length: n,
    },
    (_, i) => (i === 0 ? "G" : String(i)),
  );
  return (
    <div className={`ob-step${active ? " active" : ""}`}>
      <div className="ob-step-label">{"Step 1 of 2 \xB7 Building Info"}</div>
      <div className="ob-section-title">Building details</div>
      <div className="ob-section-desc">
        Enter the building's name, location, and contact. This becomes the building's permanent PlugPay
        listing.
      </div>
      <div className="ob-field">
        <label className="ob-label">Building Name</label>
        <input
          className="ob-input"
          type="text"
          placeholder="e.g. Anniversary Towers"
          value={obBldgName}
          onChange={(e) => setObBldgName(e.target.value)}
        />
      </div>
      <div className="ob-field">
        <label className="ob-label">Street / Location</label>
        <input className="ob-input" type="text" placeholder="e.g. Mama Ngina Street, Nairobi CBD" />
      </div>
      <div className="ob-field">
        <label className="ob-label">{"Google Maps Link \u2014 pinpoint exact location"}</label>
        <input className="ob-input" type="url" placeholder="https://maps.app.goo.gl/…" inputMode="url" />
        <div
          style={{
            fontSize: "10.5px",
            color: "var(--muted2)",
            fontFamily: "var(--fm)",
            marginTop: "6px",
            lineHeight: "1.5",
          }}
        >
          {"\u{1F4CD} Open Google Maps, drop a pin, tap "}
          <strong>{"Share \u2192 Copy link"}</strong>
          {", then paste here."}
        </div>
      </div>
      <div
        className="ob-section-divider"
        style={{
          marginTop: "6px",
        }}
      >
        {"\u{1F3E2} Floors & Stalls"}
      </div>
      <div
        className="ob-section-desc"
        style={{
          marginBottom: "10px",
        }}
      >
        Set the number of floors first, then enter how many stalls are on each floor. The total updates
        automatically.
      </div>
      <div className="ob-field">
        <label className="ob-label">Number of Floors</label>
        <input
          className="ob-input"
          type="number"
          placeholder="e.g. 6"
          min={1}
          max={30}
          value={obFloorsCount}
          onChange={(e) => setObFloorsCount(e.target.value)}
        />
      </div>
      {floorKeys.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--r6)",
            overflow: "hidden",
            marginBottom: "10px",
          }}
        >
          {floorKeys.map((k, i) => {
            var _a;
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  padding: "9px 12px",
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  {k === "G" ? "Ground Floor" : `Floor ${k}`}
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder="Stalls"
                  style={{
                    width: "90px",
                    padding: "6px 10px",
                    border: "1.5px solid var(--border2)",
                    borderRadius: "var(--r6)",
                    fontSize: "13px",
                    fontFamily: "var(--fb)",
                    textAlign: "right",
                  }}
                  value={(_a = obFloorStalls[k]) != null ? _a : ""}
                  onChange={(e) => setObFloorStall(k, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--accent-bg)",
          border: "1.5px solid var(--accent-bg2)",
          borderRadius: "var(--r6)",
          padding: "11px 14px",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--fm)",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          Total stalls
        </span>
        <span
          style={{
            fontFamily: "var(--fm)",
            fontSize: "22px",
            fontWeight: 900,
            color: "var(--accent)",
          }}
        >
          {obTotalStalls}
        </span>
      </div>
      <div
        className="ob-section-divider"
        style={{
          marginTop: "6px",
        }}
      >
        {"\u{1F3E2} Landlord account"}
      </div>
      <div
        className="ob-section-desc"
        style={{
          marginBottom: "10px",
        }}
      >
        {
          "This sets up an individual account for the building's landlord \u2014 they can sign in anytime to add more stall owners and complete monthly verification."
        }
      </div>
      <div className="ob-field">
        <label className="ob-label">Landlord / Manager Name</label>
        <input className="ob-input" type="text" placeholder="e.g. Samuel Kariuki" />
      </div>
      <div className="ob-row-2">
        <div className="ob-field">
          <label className="ob-label">Landlord Phone</label>
          <input className="ob-input" type="tel" placeholder="07XX XXX XXX" />
        </div>
        <div className="ob-field">
          <label className="ob-label">Landlord Email</label>
          <input className="ob-input" type="email" placeholder="landlord@email.com" />
        </div>
      </div>
      <div className="ob-field">
        <label className="ob-label">Building Category</label>
        <select className="ob-select">
          <option>Mixed retail (clothing + electronics + food)</option>
          <option>Fashion & Textiles</option>
          <option>Electronics & Hardware</option>
          <option>Food & Groceries</option>
          <option>General Market</option>
        </select>
      </div>
    </div>
  );
}