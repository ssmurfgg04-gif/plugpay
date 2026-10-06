"use client";

import { usePlugPay } from "@/store/context";
import { authCodeInput, authIconWrap, authLabel, authLink, authSubmitBtn, focusRing } from "@/lib/seller";

export function AuthOtpStep() {
  const { authPhone, authMethod, authOtp, setAuthOtp, authVerifyOTP, authGoBack } = usePlugPay();
  return (
    <div className="auth-shell">
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <div style={authIconWrap}>{"\u{1F4AC}"}</div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: "var(--ink)",
            marginBottom: "4px",
          }}
        >
          Enter your OTP
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: "1.55",
          }}
        >
          {"Code sent to "}
          <strong
            style={{
              color: "var(--ink)",
            }}
          >
            {authPhone.trim() || "07XX XXX XXX"}
          </strong>
          {" via"} <span>{authMethod === "sms" ? "SMS" : "WhatsApp"}</span>
          {"."}
        </div>
      </div>
      <label style={authLabel}>ONE-TIME CODE</label>
      <input
        type="tel"
        placeholder="_ _ _ _ _ _"
        maxLength={6}
        style={authCodeInput}
        value={authOtp}
        onChange={(e) => setAuthOtp(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") authVerifyOTP();
        }}
        {...focusRing()}
      />
      <button style={authSubmitBtn} onClick={() => authVerifyOTP()}>
        {"Verify & open my profile \u2192"}
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
            authGoBack();
          }}
          style={authLink}
        >
          {"\u2190 Change number"}
        </a>
      </div>
    </div>
  );
}