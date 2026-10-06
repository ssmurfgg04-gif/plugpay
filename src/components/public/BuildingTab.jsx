"use client";

import { usePlugPay } from "@/store/context";
import { useSV } from "@/lib/public";
import { BuildingViewContainer } from "@/components/building/BuildingViewContainer";

export function BuildingTab() {
  const { requireSellerLogin, openBuildingModal, stallHistory, openSellerRef } = usePlugPay();
  const sv = useSV();
  const sellerStats = sv.stats,
    stallAssignment = sv.assignment;
  return (
    <div
      className="modal-tab-body on"
      style={{
        padding: "16px",
      }}
    >
      <BuildingViewContainer id={stallAssignment.building} />
      <div
        className="bldg-card-redesign building-header-card"
        style={{
          margin: "14px 0",
        }}
      >
        <div
          className="bldg-card-grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <div className="bldg-card-stat">
            <div className="bldg-card-n">{sellerStats.avg.toFixed(1) + "\u2605"}</div>
            <div className="bldg-card-l">This merchant</div>
          </div>
          <div className="bldg-card-stat">
            <div className="bldg-card-n">{String(sellerStats.trust)}</div>
            <div className="bldg-card-l">Trust score</div>
          </div>
        </div>
      </div>
      <div
        className="rv-note"
        style={{
          marginTop: 0,
          marginBottom: 14,
        }}
      >
        <span>{"\uD83D\uDD12"}</span>
        <span>
          <b>{"A seller's record travels with them. "}</b>Trust score, reviews, sales history and documents
          belong to the seller. If they move stalls or buildings it all comes along; only the landlord
          verification at the new place starts as Pending.
        </span>
      </div>
      {sv.own && stallHistory.length > 0 && (
        <div
          className="vouch-list"
          style={{
            marginBottom: 14,
          }}
        >
          {stallHistory.map(function (x, i) {
            return (
              <div className="vouch-item" key={i}>
                <div
                  className="vouch-av"
                  style={{
                    background: "var(--muted2)",
                  }}
                >
                  {"\uD83D\uDCCD"}
                </div>
                <div className="vouch-info">
                  <div className="vouch-name">{"Previously " + x.building}</div>
                  <div className="vouch-sub">
                    {x.loc + " \u00b7 until " + new Date(x.until).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}