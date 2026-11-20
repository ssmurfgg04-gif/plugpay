"use client";
import { useState } from "react";

export function AuthLandlordOtp({ onDone }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState("email"); // email | code | pin
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const post = async (url, body) => {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return r.json();
  };

  const sendCode = async () => {
    setBusy(true); setMsg("");
    const res = await post("/api/auth/request-otp", { email, role: "landlord" });
    setBusy(false);
    if (res.ok) { setStep("code"); setMsg("Code sent. Check your inbox."); }
    else setMsg(res.error || "Failed to send code");
  };

  const verifyCode = async () => {
    setBusy(true); setMsg("");
    const res = await post("/api/auth/verify-otp", { email, code });
    setBusy(false);
    if (res.ok) { setToken(res.token); setStep("pin"); setMsg("Verified. Set your 6-digit PIN."); }
    else setMsg(res.error || "Verification failed");
  };

  const setPinAndFinish = async () => {
    setBusy(true); setMsg("");
    const res = await post("/api/auth/set-pin", { email, token, pin });
    setBusy(false);
    if (res.ok) { setMsg("Account ready. You can sign in now."); if (onDone) onDone(); }
    else setMsg(res.error || "Could not set PIN");
  };

  const pinLogin = async () => {
    setBusy(true); setMsg("");
    const res = await post("/api/auth/pin-login", { email, pin });
    setBusy(false);
    if (res.ok) { window.location.href = "/landlord/dashboard"; }
    else setMsg(res.error || "Sign-in failed");
  };

  const input = (props) => (
    <input {...props} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #ccc", borderRadius: 6, fontSize: 14, marginBottom: 12 }} />
  );

  return (
    <div>
      {msg && <div style={{ marginBottom: 10, fontSize: 13, color: msg.includes("failed") || msg.includes("incorrect") ? "#c00" : "#0a0" }}>{msg}</div>}
      {step === "email" && (
        <>
          {input({ type: "email", placeholder: "landlord@email.com", value: email, onChange: (e) => setEmail(e.target.value) })}
          <button disabled={busy || !email} onClick={sendCode} style={{ width: "100%", padding: 10, background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
            {busy ? "Sending…" : "Send verification code"}
          </button>
        </>
      )}
      {step === "code" && (
        <>
          {input({ type: "text", placeholder: "6-digit code", value: code, onChange: (e) => setCode(e.target.value), maxLength: 6 })}
          <button disabled={busy || code.length !== 6} onClick={verifyCode} style={{ width: "100%", padding: 10, background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
            {busy ? "Verifying…" : "Verify code"}
          </button>
        </>
      )}
      {step === "pin" && (
        <>
          {input({ type: "password", placeholder: "Set 6-digit PIN", value: pin, onChange: (e) => setPin(e.target.value), maxLength: 6 })}
          <button disabled={busy || pin.length !== 6} onClick={setPinAndFinish} style={{ width: "100%", padding: 10, background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", marginBottom: 8 }}>
            {busy ? "Saving…" : "Set PIN & create account"}
          </button>
          <button disabled={busy || pin.length !== 6} onClick={pinLogin} style={{ width: "100%", padding: 10, background: "#fff", color: "#1a1a2e", border: "1px solid #1a1a2e", borderRadius: 6, cursor: "pointer" }}>
            {busy ? "Signing in…" : "Sign in with PIN"}
          </button>
        </>
      )}
    </div>
  );
}
