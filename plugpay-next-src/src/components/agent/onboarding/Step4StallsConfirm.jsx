"use client";

import { useState } from "react";
import { usePlugPay } from "@/store/context";
import { floorLabel } from "@/lib/shared";
import { StallGrid } from "@/components/agent/onboarding/StallGrid";
import { stallClass, stallNameClass } from "@/lib/building";
import { StallSellerCard } from "@/components/agent/onboarding/StallSellerCard";
import { ObReview } from "@/components/agent/onboarding/ObReview";

var FALLBACK_FLOOR_KEYS = ["G", "1", "2", "3", "4", "5"];

var MIN_GRID_SIZE = 12;

export function Step4StallsConfirm({ active = true }) {
  var _a;
  const {
    obBldgName,
    obFloorsCount,
    obFloorStalls,
    obTotalStalls,
    obMerchantList,
    obStartEditMerchant,
    obCancelEditMerchant,
    obPrefillNewMerchantStall,
    obRemoveMerchant,
    obAddMerchant,
    obNewBiz,
    setObNewBiz,
    obNewName,
    setObNewName,
    obNewPhone,
    setObNewPhone,
    obNewType,
    setObNewType,
    obGoToStep,
  } = usePlugPay();
  const n = Math.min(30, Math.max(0, parseInt(obFloorsCount) || 0));
  const floorKeys =
    n > 0
      ? Array.from(
          {
            length: n,
          },
          (_, i) => (i === 0 ? "G" : String(i)),
        )
      : FALLBACK_FLOOR_KEYS;
  const [gridFloor, setGridFloor] = useState((_a = floorKeys[0]) != null ? _a : "G");
  const [action, setAction] = useState(null);
  const safeGridFloor = floorKeys.includes(gridFloor) ? gridFloor : floorKeys[0];
  const floorMerchants = obMerchantList.filter((m) => m.floor === safeGridFloor);
  const merchantByStall = {};
  floorMerchants.forEach((m) => {
    const num = parseInt(m.stallNum, 10);
    merchantByStall[Number.isFinite(num) && num > 0 ? String(num) : m.stallNum] = m;
  });
  const enteredCount = parseInt(obFloorStalls[safeGridFloor] || "0", 10) || 0;
  const maxOccupied = floorMerchants.reduce((mx, m) => Math.max(mx, parseInt(m.stallNum, 10) || 0), 0);
  const gridSize = Math.max(enteredCount, maxOccupied, MIN_GRID_SIZE);
  const gridStalls = Array.from(
    {
      length: gridSize,
    },
    (_, i) => {
      const num = String(i + 1);
      const m = merchantByStall[num];
      return {
        id: num,
        n: m == null ? void 0 : m.biz,
        s: m ? "t" : "e",
      };
    },
  );
  const merchantCount = obMerchantList.length;
  const pct = merchantCount > 0 ? 100 : 60;
  const actionMerchant = (action == null ? void 0 : action.merchantId)
    ? obMerchantList.find((m) => m.id === action.merchantId)
    : void 0;
  function openStallAction(s) {
    const m = merchantByStall[s.id];
    if (m) {
      obStartEditMerchant(m.id);
      setAction({
        floor: safeGridFloor,
        stallNum: s.id,
        merchantId: m.id,
      });
    } else {
      obPrefillNewMerchantStall(safeGridFloor, s.id);
      setAction({
        floor: safeGridFloor,
        stallNum: s.id,
      });
    }
  }
  function closeAction() {
    obCancelEditMerchant();
    setAction(null);
  }
  function saveAction() {
    if (obAddMerchant()) setAction(null);
  }
  function removeAction() {
    if (action == null ? void 0 : action.merchantId) obRemoveMerchant(action.merchantId);
    setAction(null);
  }
  return (
    <div className={`ob-step${active ? " active" : ""}`} id="ob-step-4">
      <div className="ob-step-label">{"Step 2 of 2 \xB7 Map stalls & register sellers"}</div>
      <div className="ob-section-title">Map stalls & register sellers</div>
      <div className="ob-section-desc">
        Tap a vacant stall to register the seller there, or an occupied one to edit or remove them. Then
        publish everyone at once.
      </div>
      <div
        className="ob-section-divider"
        style={{
          marginTop: "2px",
        }}
      >
        {"\u{1F5FA} Stall Map"}
      </div>
      <div className="ob-field">
        <label className="ob-label">Select Floor</label>
        <select
          className="ob-select"
          value={safeGridFloor}
          onChange={(e) => {
            setGridFloor(e.target.value);
            closeAction();
          }}
        >
          {floorKeys.map((k) => (
            <option value={k}>{floorLabel(k)}</option>
          ))}
        </select>
      </div>
      <div
        className="bldg-legend"
        style={{
          marginBottom: "10px",
        }}
      >
        <span>
          <span
            className="bl-dot"
            style={{
              background: "var(--accent-bg)",
              border: "1px solid #c798c2",
            }}
          />
          {"Occupied \u2014 tap to edit or remove"}
        </span>
        <span>
          <span
            className="bl-dot"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          />
          {"Vacant \u2014 tap to admit a seller"}
        </span>
      </div>
      <StallGrid
        stalls={gridStalls}
        onStallClick={openStallAction}
        renderCell={(s) => ({
          className: stallClass[s.s],
          clickable: true,
          title: s.s === "e" ? `Stall ${s.id} \u2014 vacant` : `${s.n} \u2014 Stall ${s.id}`,
          label: <span className={stallNameClass[s.s]}>{s.id}</span>,
        })}
      />
      {enteredCount === 0 && (
        <div
          style={{
            fontSize: "10.5px",
            color: "var(--muted2)",
            fontFamily: "var(--fm)",
            textAlign: "center",
            marginTop: "6px",
          }}
        >
          {floorLabel(safeGridFloor)}
          {"'s stall count isn't set yet \u2014 showing "}
          {MIN_GRID_SIZE}
          {" placeholder stalls. Set the exact count in Step 1."}
        </div>
      )}
      {action && (
        <StallSellerCard
          action={action}
          merchant={actionMerchant}
          onClose={closeAction}
          onSave={saveAction}
          onRemove={removeAction}
        />
      )}
      <ObReview />
    </div>
  );
}