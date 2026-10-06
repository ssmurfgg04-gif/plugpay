"use client";

import { Link } from "@/components/ui/Link";
import { PublicShellX } from "@/components/layout/PublicShellX";

export function NotFoundPage(props) {
  return (
    <PublicShellX title={props.title}>
      <div className="app-card">
        <div className="app-card-sub">{props.sub}</div>
        <div className="app-actions">
          <Link to={props.to || "/search"} className="pp-btn primary">
            {props.cta || "Search PlugPay"}
          </Link>
        </div>
      </div>
    </PublicShellX>
  );
}