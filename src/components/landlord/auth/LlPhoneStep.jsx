"use client";

import { usePlugPay } from "@/store/context";
import {
  llAuthIconWrap,
  llAuthLabel,
  llAuthLink,
  llAuthSubmitBtn,
  llAuthTextInput,
  llFocusRing,
} from "@/lib/landlord";

export function LlPhoneStep() {
  const { llMethod, llSetMethod, llPhone, setLlPhone, llSendOTP, llShowPinLogin } = usePlugPay();
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
        <div style={llAuthIconWrap}>{"\u{1F3E2}"}</div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: "var(--ink)",
            marginBottom: "4px",
          }}
        >
          Landlord sign-in
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: "1.55",
          }}
        >
          Enter your email or phone number. We'll verify you're the registered owner or property manager for
          your building(s).
        </div>
      </div>
      <div className="method-toggle">
        <button
          type="button"
          className={`method-toggle-btn${llMethod === "sms" ? " active" : ""}`}
          onClick={() => llSetMethod("sms")}
        >
          {"\u{1F4F1} SMS"}
        </button>
        <button
          type="button"
          className={`method-toggle-btn${llMethod === "email" ? " active" : ""}`}
          onClick={() => llSetMethod("email")}
        >
          {"\u2709\uFE0F Email"}
        </button>
      </div>
      <label style={llAuthLabel}>{llMethod === "email" ? "EMAIL ADDRESS" : "PHONE NUMBER"}</label>
      <input
        type={llMethod === "email" ? "email" : "tel"}
        placeholder={llMethod === "email" ? "you@email.com" : "07XX XXX XXX"}
        style={llAuthTextInput}
        value={llPhone}
        onChange={(e) => setLlPhone(e.target.value)}
        {...llFocusRing()}
      />
      <button style={llAuthSubmitBtn} onClick={() => llSendOTP()}>
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
        Only verified landlords & property managers can access trader verification.
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
            llShowPinLogin();
          }}
          style={llAuthLink}
        >
          {"Already set a PIN? Sign in with phone + PIN \u2192"}
        </a>
      </div>
    </div>
  );
}