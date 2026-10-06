"use client";

import { usePlugPay } from "@/store/context";
import { authIconWrap, authLabel, authLink, authSubmitBtn, focusRing } from "@/lib/seller";
import { LOGO_DATA_URI } from "@/lib/assets";

var authTextInput = {
  width: "100%",
  padding: "13px 14px",
  border: "1.5px solid var(--border2)",
  borderRadius: "var(--r6)",
  fontSize: "16px",
  fontFamily: "var(--fb)",
  outline: "none",
  background: "var(--bg)",
  transition: "border-color .2s",
  marginBottom: "16px",
};

export function AuthPhoneStep() {
  const { authMethod, authSetMethod, authPhone, setAuthPhone, authSendOTP, authShowPinLogin, claimInfo } =
    usePlugPay();
  return (
    <div className="auth-shell">
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <div style={authIconWrap}>{"\u{1F510}"}</div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: "var(--ink)",
            marginBottom: "4px",
          }}
        >
          Sign in to{" "}
          <img
            src={LOGO_DATA_URI}
            alt="PlugPay"
            style={{
              height: "22px",
              width: "auto",
              verticalAlign: "-5px",
              display: "inline-block",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: "1.55",
          }}
        >
          {
            "Enter your WhatsApp number. We'll send you a one-time code \u2014 SMS if WhatsApp isn't available."
          }
        </div>
      </div>
      {claimInfo && (
        <div
          className="rv-note"
          style={{
            marginBottom: "14px",
          }}
        >
          <span>{"\u{1F4F2}"}</span>
          <span>
            <b>{"Claim link opened. "}</b>
            {"Sign in with the number on file to claim " +
              claimInfo.name +
              " \u00b7 " +
              claimInfo.building +
              ", " +
              claimInfo.loc +
              "."}
          </span>
        </div>
      )}
      <div className="method-toggle">
        <button
          type="button"
          className={`method-toggle-btn${authMethod === "whatsapp" ? " active" : ""}`}
          onClick={() => authSetMethod("whatsapp")}
        >
          {"\u{1F4AC} WhatsApp"}
        </button>
        <button
          type="button"
          className={`method-toggle-btn${authMethod === "sms" ? " active" : ""}`}
          onClick={() => authSetMethod("sms")}
        >
          {"\u{1F4F1} SMS"}
        </button>
      </div>
      <label style={authLabel}>{authMethod === "sms" ? "PHONE NUMBER" : "WHATSAPP NUMBER"}</label>
      <input
        type="tel"
        placeholder="07XX XXX XXX"
        style={authTextInput}
        value={authPhone}
        onChange={(e) => setAuthPhone(e.target.value)}
        {...focusRing()}
      />
      <button style={authSubmitBtn} onClick={() => authSendOTP()}>
        {"Send OTP \u2192"}
      </button>
      <div
        style={{
          textAlign: "center",
          fontSize: "11.5px",
          color: "var(--muted2)",
          marginTop: "14px",
          lineHeight: "1.6",
        }}
      >
        Your stall is registered by an agent.
        <br />
        Claimed your profile? Sign in here with the phone number on file to complete it.
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "12px",
          marginTop: "10px",
          fontFamily: "var(--fm)",
        }}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            authShowPinLogin();
          }}
          style={authLink}
        >
          {"Already set a PIN? Sign in with PIN \u2192"}
        </a>
      </div>
    </div>
  );
}