"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";

/* ---- Admit seller ---- */
/* ---- Admit seller ---- */
var labelStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--muted)",
  fontFamily: "var(--fm)",
  display: "block",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: ".06em",
};

var inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid var(--border2)",
  borderRadius: "var(--r6)",
  fontSize: "14.5px",
  fontFamily: "var(--fb)",
  outline: "none",
  background: "var(--bg)",
  marginBottom: "12px",
};

function focusHandlers() {
  return {
    onFocus: (e) => (e.currentTarget.style.borderColor = "var(--accent)"),
    onBlur: (e) => (e.currentTarget.style.borderColor = "var(--border2)"),
  };
}

export function AdmitSellerModal() {
  const {
    asStallLabel,
    asName,
    setAsName,
    asPhone,
    setAsPhone,
    asCategory,
    setAsCategory,
    asSubmitting,
    llSubmitAdmitSeller,
  } = usePlugPay();
  return (
    <Modal id="modal-admit-seller" innerClassName="modal">
      <div
        style={{
          padding: "48px 24px 24px",
          maxWidth: "380px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "var(--accent-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              margin: "0 auto 10px",
            }}
          >
            {"\u{1F513}"}
          </div>
          <div
            style={{
              fontSize: "19px",
              fontWeight: 900,
              color: "var(--ink)",
              marginBottom: "4px",
            }}
          >
            Admit a new seller
          </div>
          <div
            style={{
              fontSize: "12.5px",
              color: "var(--muted)",
              lineHeight: "1.55",
            }}
          >
            {asStallLabel || "Into an unoccupied stall"}
          </div>
        </div>
        <label style={labelStyle}>SELLER NAME</label>
        <input
          type="text"
          placeholder="e.g. Grace Wambui"
          style={inputStyle}
          value={asName}
          onChange={(e) => setAsName(e.target.value)}
          {...focusHandlers()}
        />
        <label style={labelStyle}>PHONE NUMBER</label>
        <input
          type="tel"
          placeholder="07XX XXX XXX"
          style={inputStyle}
          value={asPhone}
          onChange={(e) => setAsPhone(e.target.value)}
          {...focusHandlers()}
        />
        <label style={labelStyle}>BUSINESS CATEGORY</label>
        <input
          type="text"
          placeholder="e.g. Fashion, Electronics…"
          style={{
            ...inputStyle,
            marginBottom: "16px",
          }}
          value={asCategory}
          onChange={(e) => setAsCategory(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") llSubmitAdmitSeller();
          }}
          {...focusHandlers()}
        />
        <div
          style={{
            fontSize: "11.5px",
            color: "var(--muted)",
            lineHeight: "1.6",
            background: "var(--accent-bg)",
            borderRadius: "var(--r6)",
            padding: "10px 12px",
            marginBottom: "16px",
            display: "flex",
            gap: "8px",
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            {"\u2139\uFE0F"}
          </span>
          <span>
            Admitting a seller here marks them Verified and sends a claim link to their WhatsApp. It opens the
            sign-in page so they can take over the stall.
          </span>
        </div>
        <button
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "100px",
            background: "var(--grad)",
            color: "#fff",
            fontFamily: "var(--fb)",
            fontSize: "15px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => llSubmitAdmitSeller()}
          disabled={asSubmitting}
        >
          {asSubmitting ? "Admitting\u2026" : "Admit & verify seller \u2192"}
        </button>
      </div>
    </Modal>
  );
}