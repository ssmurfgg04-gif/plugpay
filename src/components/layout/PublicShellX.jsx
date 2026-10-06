"use client";

import { goBack } from "@/lib/nav";
import { Link } from "@/components/ui/Link";
import { LOGO_DATA_URI } from "@/lib/assets";

export function PublicShellX(props) {
  var children = props.children,
    title = props.title,
    subtitle = props.subtitle;
  return (
    <div className="public-inner-shell">
      <header className="inner-public-header">
        <button className="modal-back pg-back" aria-label="Back" onClick={goBack}>
          {"\u2190"}
        </button>
        <Link to="/" className="inner-brand">
          <img src={LOGO_DATA_URI} alt="PlugPay" />
        </Link>
        <button className="modal-close pg-x" aria-label="Close" onClick={goBack}>
          {"\u2715"}
        </button>
      </header>
      {(title || subtitle) && (
        <div className="inner-page-heading">
          <div className="eyebrow">PlugPay</div>
          {title && <h1>{title}</h1>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}