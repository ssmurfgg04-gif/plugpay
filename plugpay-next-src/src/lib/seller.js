import { createContext } from "react";
import { usePlugPay } from "@/store/context";
import { appBase, codeOf } from "@/lib/shared";

/* ---- Auth: sign in and register ---- */
export var authIconWrap = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "var(--accent-bg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "26px",
  margin: "0 auto 12px",
};

export var authLabel = {
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--muted)",
  fontFamily: "var(--fm)",
  display: "block",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: ".06em",
};

export var authCodeInput = {
  width: "100%",
  padding: "16px 14px",
  border: "1.5px solid var(--border2)",
  borderRadius: "var(--r6)",
  fontSize: "28px",
  fontFamily: "var(--fm)",
  outline: "none",
  background: "var(--bg)",
  transition: "border-color .2s",
  marginBottom: "16px",
  letterSpacing: "10px",
  textAlign: "center",
};

export var authSubmitBtn = {
  width: "100%",
  padding: "14px",
  borderRadius: "100px",
  background: "var(--grad)",
  color: "#fff",
  fontFamily: "var(--fb)",
  fontSize: "15px",
  fontWeight: 800,
  border: "none",
  cursor: "pointer",
};

export var authLink = {
  color: "var(--accent)",
  textDecoration: "none",
  fontWeight: 700,
};

export function focusRing() {
  return {
    onFocus: (e) => (e.currentTarget.style.borderColor = "var(--accent)"),
    onBlur: (e) => (e.currentTarget.style.borderColor = "var(--border2)"),
  };
}

export var DashCtx = createContext(null);

export function useSellerProfileForm() {
  var pp = usePlugPay();
  var sp = pp.sellerProfile;
  var S = function (k) {
    return function (v) {
      var n = {};
      n[k] = v;
      pp.updateSellerProfile(n);
    };
  };
  var pm = sp.payMethod || "Paybill";
  var PMETHODS = ["Paybill", "Till number", "Send money", "Bank transfer"];
  var noAcct = pm === "Till number" || pm === "Send money";
  var YEARS = (function () {
    var a = [],
      y = new Date().getFullYear();
    for (; y >= 1970; y--) a.push(String(y));
    return a;
  })();
  return {
    pp: pp,
    sp: sp,
    S: S,
    pm: pm,
    PMETHODS: PMETHODS,
    noAcct: noAcct,
    YEARS: YEARS,
  };
}

var REVIEW_WINDOW_MS = 6 * 60 * 60 * 1000;

export function reviewLink(c) {
  return appBase() + "/review/" + encodeURIComponent(codeOf(c));
}

export function reviewStatus(r) {
  if (!r)
    return {
      state: "none",
      msLeft: 0,
    };
  if (r.review)
    return {
      state: "done",
      msLeft: 0,
    };
  if (!r.sentAt)
    return {
      state: "notsent",
      msLeft: 0,
    };
  var left = new Date(r.sentAt).getTime() + REVIEW_WINDOW_MS - Date.now();
  return left > 0
    ? {
        state: "open",
        msLeft: left,
      }
    : {
        state: "expired",
        msLeft: 0,
      };
}

export function timeLeft(ms) {
  var m = Math.max(1, Math.ceil(ms / 60000)),
    hh = Math.floor(m / 60),
    mm = m % 60;
  return hh ? hh + "h " + mm + "m" : mm + "m";
}

export function sellerBadgeInfo(pp) {
  return {
    plugpay: true,
    landlord: !!pp.sellerProfile.llPhoneVerified,
  };
}

function waDigits(phone) {
  var d = (phone || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.charAt(0) === "0") return "254" + d.slice(1);
  if (d.length === 9) return "254" + d;
  return d;
}

export function openWhatsApp(phone, text) {
  var url = "https://wa.me/" + waDigits(phone) + "?text=" + encodeURIComponent(text);
  try {
    window.open(url, "_blank", "noopener");
  } catch (e) {}
}

export function salesDocStatus(kind, d) {
  if (kind === "invoice") return d.status === "PAID" ? "COMPLETE" : d.docStatus || "PENDING";
  return d.docStatus || "COMPLETE";
}