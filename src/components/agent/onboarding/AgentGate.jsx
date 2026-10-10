"use client";

import { usePlugPay } from "@/store/context";

/* ---- Agent sign-in gate: email + password (no OTP) ---- */
export function AgentGate() {
  const {
    obAgentMode,
    obAgentSetMethod,
    obAgentEmail,
    setObAgentEmail,
    obAgentPassword,
    setObAgentPassword,
    obAgentError,
    obAgentSending,
    obAgentSendOtp,
    closeModal,
    openLandlordModal,
  } = usePlugPay();
  return (
    <div className="ob-agent-gate">
      <div className="ob-agent-icon">{"\u{1F4CD}"}</div>
      <div className="ob-agent-title">Agent sign-in required</div>
      <div className="ob-agent-sub">
        Sign in with your email and password to onboard a building. Every stall you register is tied to
        your agent ID for accountability.
      </div>
      <div className="method-toggle" role="tablist" aria-label="Sign in or create account">
        <button
          type="button"
          className={`method-toggle-btn${obAgentMode === "signin" ? " active" : ""}`}
          onClick={() => obAgentSetMethod("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`method-toggle-btn${obAgentMode === "register" ? " active" : ""}`}
          onClick={() => obAgentSetMethod("register")}
        >
          Create account
        </button>
      </div>
      <div>
        <label className="ob-agent-label">Email address</label>
        <input
          className="ob-agent-input"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={obAgentEmail}
          onChange={(e) => setObAgentEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") obAgentSendOtp();
          }}
        />
        <label className="ob-agent-label">Password</label>
        <input
          className="ob-agent-input"
          type="password"
          autoComplete={obAgentMode === "register" ? "new-password" : "current-password"}
          placeholder={obAgentMode === "register" ? "At least 8 characters" : "Your password"}
          value={obAgentPassword}
          onChange={(e) => setObAgentPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") obAgentSendOtp();
          }}
        />
        {obAgentError ? (
          <div
            role="alert"
            style={{
              background: "var(--bg2, #fdf2f2)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "9px 12px",
              fontSize: "12.5px",
              color: "#b42318",
              margin: "10px 0",
              lineHeight: "1.5",
            }}
          >
            {obAgentError}
          </div>
        ) : null}
        <button className="ob-agent-btn" onClick={() => obAgentSendOtp()} disabled={obAgentSending}>
          {obAgentSending
            ? "Please wait\u2026"
            : obAgentMode === "register"
              ? "Create agent account \u2192"
              : "Sign in \u2192"}
        </button>
      </div>
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
