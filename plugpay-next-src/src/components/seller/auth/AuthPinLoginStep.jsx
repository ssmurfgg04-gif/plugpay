"use client";

import { usePlugPay } from "@/store/context";
import { authCodeInput, authIconWrap, authLabel, authLink, authSubmitBtn, focusRing } from "@/lib/seller";

export function AuthPinLoginStep() {
  const { authPinLoginValue, setAuthPinLoginValue, authPinLogin, authGoBackFromPin } = usePlugPay();
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
          Sign in with PIN
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: "1.55",
          }}
        >
          Enter your 6-digit PIN to unlock your stall profile.
        </div>
      </div>
      <label style={authLabel}>6-DIGIT PIN</label>
      <input
        type="password"
        inputMode="numeric"
        placeholder="_ _ _ _ _ _"
        maxLength={6}
        style={authCodeInput}
        value={authPinLoginValue}
        onChange={(e) => setAuthPinLoginValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") authPinLogin();
        }}
        {...focusRing()}
      />
      <button style={authSubmitBtn} onClick={() => authPinLogin()}>
        {"Unlock my profile \u2192"}
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
            authGoBackFromPin();
          }}
          style={authLink}
        >
          {"\u2190 Use OTP instead"}
        </a>
      </div>
    </div>
  );
}