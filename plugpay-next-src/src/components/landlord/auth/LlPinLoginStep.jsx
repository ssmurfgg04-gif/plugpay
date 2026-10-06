"use client";

import { usePlugPay } from "@/store/context";
import {
  llAuthCodeInput,
  llAuthIconWrap,
  llAuthLabel,
  llAuthLink,
  llAuthSubmitBtn,
  llAuthTextInput,
  llFocusRing,
} from "@/lib/landlord";

export function LlPinLoginStep() {
  const {
    llPinLoginPhone,
    setLlPinLoginPhone,
    llPinLoginPin,
    setLlPinLoginPin,
    llPinLogin,
    llGoBackFromPin,
  } = usePlugPay();
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
          Sign in with PIN
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: "1.55",
          }}
        >
          Enter your phone number and 6-digit PIN.
        </div>
      </div>
      <label style={llAuthLabel}>PHONE NUMBER</label>
      <input
        type="tel"
        placeholder="07XX XXX XXX"
        style={{
          ...llAuthTextInput,
          marginBottom: "14px",
        }}
        value={llPinLoginPhone}
        onChange={(e) => setLlPinLoginPhone(e.target.value)}
        {...llFocusRing()}
      />
      <label style={llAuthLabel}>6-DIGIT PIN</label>
      <input
        type="password"
        inputMode="numeric"
        placeholder="_ _ _ _ _ _"
        maxLength={6}
        style={llAuthCodeInput}
        value={llPinLoginPin}
        onChange={(e) => setLlPinLoginPin(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") llPinLogin();
        }}
        {...llFocusRing()}
      />
      <button style={llAuthSubmitBtn} onClick={() => llPinLogin()}>
        {"Sign in \u2192"}
      </button>
      <div
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "var(--muted2)",
          marginTop: "14px",
          fontFamily: "var(--fm)",
        }}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            llGoBackFromPin();
          }}
          style={llAuthLink}
        >
          {"\u2190 Use OTP instead"}
        </a>
      </div>
    </div>
  );
}