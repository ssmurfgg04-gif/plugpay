"use client";

import { usePlugPay } from "@/store/context";
import { llAuthCodeInput, llAuthIconWrap, llAuthLabel, llAuthSubmitBtn, llFocusRing } from "@/lib/landlord";

export function LlSetPinStep() {
  const { llSetPinValue, setLlSetPinValue, llSetPin } = usePlugPay();
  return (
    <div
      style={{
        padding: "32px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <div style={llAuthIconWrap}>{"\u{1F511}"}</div>
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
          {"Use this PIN with your phone number to sign in next time \u2014 no OTP needed."}
        </div>
      </div>
      <label style={llAuthLabel}>CHOOSE A 6-DIGIT PIN</label>
      <input
        type="password"
        inputMode="numeric"
        placeholder="_ _ _ _ _ _"
        maxLength={6}
        style={llAuthCodeInput}
        value={llSetPinValue}
        onChange={(e) => setLlSetPinValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") llSetPin();
        }}
        {...llFocusRing()}
      />
      <button style={llAuthSubmitBtn} onClick={() => llSetPin()}>
        {"Set PIN & open dashboard \u2192"}
      </button>
    </div>
  );
}