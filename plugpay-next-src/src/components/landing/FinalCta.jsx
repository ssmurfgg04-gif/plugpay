"use client";

import { usePlugPay } from "@/store/context";

export function FinalCta() {
  const { openOnboard, openLandlordModal } = usePlugPay();
  return (
    <div className="final-cta" id="final-cta">
      <h2>Ready to sell without the risk?</h2>
      <p className="section-p">
        PlugPay bridges the gap between a DM and a real sale. Join other verified traders building trust on
        WhatsApp today.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center",
        }}
      >
        <button className="btn-mint" onClick={() => openOnboard()}>
          {"I'm an agent \u2192"}
        </button>
        <button
          className="btn-mint"
          style={{
            background: "transparent",
            border: "1.5px solid rgba(255,255,255,.25)",
            color: "#fff",
          }}
          onClick={() => openLandlordModal()}
        >
          I own a building
        </button>
      </div>
    </div>
  );
}