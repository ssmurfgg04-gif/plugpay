"use client";

import { useState } from "react";
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

var authToggleWrap = {
  display: "flex",
  gap: "8px",
  padding: "4px",
  background: "var(--bg2, #f6f4f8)",
  borderRadius: "var(--r6)",
  marginBottom: "18px",
};

var authToggleBtn = {
  flex: 1,
  padding: "9px 0",
  borderRadius: "calc(var(--r6) - 3px)",
  border: "none",
  fontSize: "13.5px",
  fontWeight: 800,
  fontFamily: "var(--fb)",
  cursor: "pointer",
  background: "transparent",
  color: "var(--muted)",
  transition: "all .18s",
};

/* ---- Email + password sign in / create account (no OTP, no SMS) ---- */
export function AuthEmailStep() {
  const {
    authRole,
    authMode,
    authSetMode,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authBusinessName,
    setAuthBusinessName,
    authBusy,
    authError,
    authSubmit,
  } = usePlugPay();

  const [showPw, setShowPw] = useState(false);

  var roleCopy = {
    trader: {
      title: "Seller account",
      sub: "Sign in with your email and password \u2014 no SMS codes. New here? Create your free seller account in seconds.",
      cta: "Create seller account",
    },
    landlord: {
      title: "Landlord account",
      sub: "Manage your building, stalls and verification. Use your email and password \u2014 no one-time codes.",
      cta: "Create landlord account",
    },
    agent: {
      title: "Agent account",
      sub: "Onboard buildings and register traders. Sign in with your email and password.",
      cta: "Create agent account",
    },
  }[authRole || "trader"];

  return (
    <div className="auth-shell">
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
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
            style={{ height: "22px", width: "auto", verticalAlign: "-5px", display: "inline-block" }}
          />
        </div>
        <div style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.55" }}>{roleCopy.sub}</div>
      </div>

      <div style={authToggleWrap} role="tablist" aria-label="Sign in or create account">
        <button
          type="button"
          role="tab"
          aria-selected={authMode === "signin"}
          style={{ ...authToggleBtn, ...(authMode === "signin" ? { background: "var(--ink)", color: "#fff" } : null) }}
          onClick={() => authSetMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={authMode === "register"}
          style={{ ...authToggleBtn, ...(authMode === "register" ? { background: "var(--ink)", color: "#fff" } : null) }}
          onClick={() => authSetMode("register")}
        >
          Create account
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          authSubmit();
        }}
      >
        {authMode === "register" && (
          <div>
            <label style={authLabel} htmlFor="pp-auth-name">
              Business / your name <span style={{ color: "var(--muted)", fontWeight: 500 }}>(optional)</span>
            </label>
            <input
              id="pp-auth-name"
              style={{ ...authTextInput, ...focusRing }}
              type="text"
              autoComplete="organization"
              placeholder="e.g. Wanjiku Electronics"
              value={authBusinessName}
              onChange={(e) => setAuthBusinessName(e.target.value)}
            />
          </div>
        )}

        <label style={authLabel} htmlFor="pp-auth-email">
          Email address
        </label>
        <input
          id="pp-auth-email"
          style={{ ...authTextInput, ...focusRing }}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={authEmail}
          onChange={(e) => setAuthEmail(e.target.value)}
        />

        <label style={authLabel} htmlFor="pp-auth-password">
          Password
        </label>
        <input
          id="pp-auth-password"
          style={{ ...authTextInput, ...focusRing }}
          type={showPw ? "text" : "password"}
          autoComplete={authMode === "signin" ? "current-password" : "new-password"}
          placeholder={authMode === "register" ? "At least 8 characters" : "Your password"}
          value={authPassword}
          onChange={(e) => setAuthPassword(e.target.value)}
        />
        <div style={{ marginTop: "-10px", marginBottom: "14px", textAlign: "right" }}>
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            style={{
              background: "none",
              border: "none",
              fontSize: "12px",
              color: "var(--muted)",
              cursor: "pointer",
              fontFamily: "var(--fb)",
            }}
          >
            {showPw ? "Hide password" : "Show password"}
          </button>
        </div>

        {authError ? (
          <div
            style={{
              background: "var(--bg2, #fdf2f2)",
              border: "1px solid var(--border2)",
              borderRadius: "var(--r4, 10px)",
              padding: "10px 12px",
              fontSize: "13px",
              color: "#b42318",
              marginBottom: "14px",
              lineHeight: "1.5",
            }}
            role="alert"
          >
            {authError}
          </div>
        ) : null}

        <button type="submit" className={authSubmitBtn} disabled={authBusy} style={{ width: "100%", opacity: authBusy ? 0.7 : 1 }}>
          {authBusy
            ? "Please wait\u2026"
            : authMode === "signin"
              ? "Sign in"
              : roleCopy.cta}
        </button>
      </form>

      <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12.5px", color: "var(--muted)", lineHeight: "1.6" }}>
        {authMode === "signin" ? (
          <span>
            New to PlugPay?{" "}
            <button
              type="button"
              onClick={() => authSetMode("register")}
              style={{ ...authLink, background: "none", border: "none", cursor: "pointer" }}
            >
              Create a free account
            </button>
          </span>
        ) : (
          <span>Free forever for sellers \u00b7 Your data stays yours</span>
        )}
      </div>
    </div>
  );
}
