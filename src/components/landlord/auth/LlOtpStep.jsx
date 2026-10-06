"use client";

import { usePlugPay } from "@/store/context";
import {
  llAuthCodeInput,
  llAuthIconWrap,
  llAuthLabel,
  llAuthLink,
  llAuthSubmitBtn,
  llFocusRing,
} from "@/lib/landlord";

export function LlOtpStep() {
  const { llPhone, llMethod, llOtp, setLlOtp, llVerifyOTP, llGoBack } = usePlugPay();
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
        <div style={llAuthIconWrap}>{"\u{1F4AC}"}</div>
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
          Code sent to{" "}
          <strong
            style={{
              color: "var(--ink)",
            }}
          >
            {llPhone.trim() || (llMethod === "email" ? "you@email.com" : "07XX XXX XXX")}
          </strong>{" "}
          {"via "}
          <span>{llMethod === "email" ? "email" : "SMS"}</span>
          {"."}
        </div>
      </div>
      <label style={llAuthLabel}>ONE-TIME CODE</label>
      <input
        type="tel"
        placeholder="_ _ _ _ _ _"
        maxLength={6}
        style={llAuthCodeInput}
        value={llOtp}
        onChange={(e) => setLlOtp(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") llVerifyOTP();
        }}
        {...llFocusRing()}
      />
      <button style={llAuthSubmitBtn} onClick={() => llVerifyOTP()}>
        {"Verify & open dashboard \u2192"}
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
            llGoBack();
          }}
          style={llAuthLink}
        >
          {"\u2190 Change number"}
        </a>
      </div>
    </div>
  );
}