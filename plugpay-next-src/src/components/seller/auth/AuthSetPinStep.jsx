"use client";

import { usePlugPay } from "@/store/context";
import { authCodeInput, authIconWrap, authLabel, authSubmitBtn, focusRing } from "@/lib/seller";

export function AuthSetPinStep() {
  const { authSetPinValue, setAuthSetPinValue, authSetPin } = usePlugPay();
  return (
    <div className="auth-shell">
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <div style={authIconWrap}>{"\u{1F511}"}</div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: "var(--ink)",
            marginBottom: "4px",
          }}
        >
          Set a 6-digit PIN
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: "1.55",
          }}
        >
          {"Use this PIN to unlock your stall profile next time \u2014 no OTP needed."}
        </div>
      </div>
      <label style={authLabel}>CHOOSE A 6-DIGIT PIN</label>
      <input
        type="password"
        inputMode="numeric"
        placeholder="_ _ _ _ _ _"
        maxLength={6}
        style={authCodeInput}
        value={authSetPinValue}
        onChange={(e) => setAuthSetPinValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") authSetPin();
        }}
        {...focusRing()}
      />
      <button style={authSubmitBtn} onClick={() => authSetPin()}>
        {"Set PIN & open my profile \u2192"}
      </button>
    </div>
  );
}