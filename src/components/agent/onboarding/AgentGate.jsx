"use client";

import { usePlugPay } from "@/store/context";

/* ---- Agent sign-in gate ---- */
export function AgentGate() {
  const {
    obAgentMethod,
    obAgentSetMethod,
    obAgentPhoneStep,
    obAgentPhone,
    setObAgentPhone,
    obAgentOtp,
    setObAgentOtp,
    obAgentSending,
    obAgentVerifying,
    obAgentSendOtp,
    obAgentVerifyOtp,
    closeModal,
    openLandlordModal,
  } = usePlugPay();
  return (
    <div className="ob-agent-gate">
      <div className="ob-agent-icon">{"\u{1F4CD}"}</div>
      <div className="ob-agent-title">Agent sign-in required</div>
      <div className="ob-agent-sub">
        Verify with your email or phone to onboard a building. Every stall you register is tied to your agent
        ID for accountability.
      </div>
      <div className="method-toggle">
        <button
          type="button"
          className={`method-toggle-btn${obAgentMethod === "sms" ? " active" : ""}`}
          onClick={() => obAgentSetMethod("sms")}
        >
          {"\u{1F4F1} SMS"}
        </button>
        <button
          type="button"
          className={`method-toggle-btn${obAgentMethod === "email" ? " active" : ""}`}
          onClick={() => obAgentSetMethod("email")}
        >
          {"\u2709\uFE0F Email"}
        </button>
      </div>
      {obAgentPhoneStep ? (
        <div>
          <label className="ob-agent-label">
            {obAgentMethod === "email" ? "Email Address" : "Phone Number"}
          </label>
          <input
            className="ob-agent-input"
            type={obAgentMethod === "email" ? "email" : "tel"}
            placeholder={obAgentMethod === "email" ? "you@email.com" : "07XX XXX XXX"}
            value={obAgentPhone}
            onChange={(e) => setObAgentPhone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") obAgentSendOtp();
            }}
          />
          <button className="ob-agent-btn" onClick={() => obAgentSendOtp()} disabled={obAgentSending}>
            {obAgentSending ? "Sending\u2026" : "Send OTP \u2192"}
          </button>
        </div>
      ) : (
        <div>
          <label className="ob-agent-label">One-Time Code</label>
          <input
            className="ob-agent-otp-input"
            type="tel"
            placeholder="_ _ _ _ _ _"
            maxLength={6}
            value={obAgentOtp}
            onChange={(e) => setObAgentOtp(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") obAgentVerifyOtp();
            }}
          />
          <button className="ob-agent-btn" onClick={() => obAgentVerifyOtp()} disabled={obAgentVerifying}>
            {obAgentVerifying ? "Verifying\u2026" : "Verify & continue \u2192"}
          </button>
        </div>
      )}
      <div
        style={{
          textAlign: "center",
          marginTop: "18px",
          paddingTop: "16px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontSize: "11.5px",
            color: "var(--muted2)",
            marginBottom: "8px",
          }}
        >
          Own or manage this building instead?
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            closeModal("modal-onboard");
            openLandlordModal();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12.5px",
            fontWeight: 700,
            color: "var(--accent)",
            textDecoration: "none",
            fontFamily: "var(--fb)",
          }}
        >
          {"\u{1F3E2} Sign in as landlord \u2192"}
        </a>
      </div>
    </div>
  );
}