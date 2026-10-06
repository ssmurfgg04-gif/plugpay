"use client";

import { goBack } from "@/lib/nav";
import { Link } from "@/components/ui/Link";
import { LOGO_DATA_URI } from "@/lib/assets";

/* Generic portal frame: header / body / dock / nav are slots. */
/* Generic portal frame: header / body / dock / nav are slots. */
export function TopBar(p) {
  var back = (
    <button
      className={p.variant === "app" ? "modal-back pg-back" : "tp-navbar-btn"}
      aria-label="Back"
      onClick={goBack}
    >
      {"\u2190"}
    </button>
  );
  var close = (
    <button className="modal-close pg-x" aria-label="Close" onClick={goBack}>
      {"\u2715"}
    </button>
  );
  if (p.variant === "app")
    return (
      <header className="app-topbar">
        <div className="app-topbar-inner">
          {back}
          <Link to="/" className="app-brand">
            <img src={LOGO_DATA_URI} alt="PlugPay" />
          </Link>
          <div className="app-role">{p.title}</div>
          {close}
        </div>
      </header>
    );
  return (
    <div className="tp-navbar-fixed">
      {back}
      <div className="tp-navbar-title">{p.title}</div>
      <div className="sp-right">
        {p.actions}
        {close}
      </div>
    </div>
  );
}