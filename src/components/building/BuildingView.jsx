"use client";

import { FloorMap } from "@/components/building/FloorMap";

/* Presentational: no context, no modal. Reusable by modal, page, landlord, agent. */
/* Presentational: no context, no modal. Reusable by modal, page, landlord, agent. */
export function BuildingView(p) {
  var legend = (
    <div className="bldg-legend">
      <span>
        <span
          className="bl-dot"
          style={{
            background: "var(--accent-bg)",
            border: "1px solid #c798c2",
          }}
        />
        Occupied
      </span>
      <span>
        <span
          className="bl-dot"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
          }}
        />
        Vacant
      </span>
    </div>
  );
  return (
    <>
      <div className="bldg-hero bldg-hero-redesign">
        <div className="bh-inner">
          <div className="bh-name">{"\uD83C\uDFE2 " + p.name}</div>
          <div className="bh-addr">{p.address}</div>
          <div className="bldg-hero-grid">
            {p.stats.map(function (x) {
              return (
                <div className="bldg-hero-cell" key={x.l}>
                  <div className="bldg-hero-n">{x.n}</div>
                  <div className="bldg-hero-l">{x.l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bldg-body">
        <FloorMap
          className="bldg-map-section"
          title="Floor map — click a stall to view merchant"
          titleClass="bldg-map-label"
          tabs={p.tabs}
          floors={p.floors}
          floor={p.floor}
          onFloorChange={p.onFloorChange}
          onStallSelect={p.onStallSelect}
          subtitle={p.subtitle}
          subtitleClass="bldg-map-sub"
          isClickable={
            p.isClickable ||
            function (st) {
              return st.s !== "e";
            }
          }
          stallTitle={
            p.stallTitle ||
            function (st) {
              return st.s === "e" ? "Vacant" : "Occupied \u2014 tap to view seller profile";
            }
          }
          footer={legend}
        />
        {p.merchants.length > 0 && (
          <div
            style={{
              marginTop: "20px",
            }}
          >
            <div className="bldg-map-label">Top merchants</div>
            <div className="bldg-merch-list">
              {p.merchants.map(function (m) {
                return (
                  <div
                    className="bml-item"
                    key={m.name}
                    onClick={function () {
                      p.onMerchantSelect(m);
                    }}
                  >
                    <div
                      className="bml-av"
                      style={{
                        background: m.color,
                      }}
                    >
                      {m.initials}
                    </div>
                    <div className="bml-info">
                      <div className="bml-name">{m.name}</div>
                      <div className="bml-sub">{m.sub}</div>
                    </div>
                    <div className="bml-rating">
                      {m.rating}
                      {"\u2605"}
                      <span className="bml-rev">
                        {" ("}
                        {m.rev}
                        {")"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}