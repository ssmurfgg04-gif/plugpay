"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/components/ui/Link";
import { usePlugPay } from "@/store/context";
import { PublicShellX } from "@/components/layout/PublicShellX";

export function ClaimPage(props) {
  var pp = usePlugPay();
  var claim = pp.agentClaims.filter(function (c) {
    return c.token === props.token;
  })[0];
  var opened = useRef(false);
  useEffect(
    function () {
      if (claim && claim.status === "INVITED" && !opened.current) {
        opened.current = true;
        setTimeout(function () {
          pp.openClaimSignIn(claim.token);
        }, 120);
      }
    },
    [claim && claim.status],
  );
  if (!claim)
    return (
      <PublicShellX title="Claim link not found">
        <div className="app-card">
          <div className="app-card-title">This claim link isn't valid or has expired.</div>
          <div className="app-card-sub">Ask your agent or landlord to resend it.</div>
          <Link to="/" className="pp-btn secondary">
            Return home
          </Link>
        </div>
      </PublicShellX>
    );
  if (claim.status === "CLAIMED")
    return (
      <PublicShellX title="Stall claimed" subtitle={claim.buildingName}>
        <section className="app-card">
          <div className="app-card-title">
            {"\u2713 " + (claim.businessName || claim.ownerName || "This stall") + " is claimed"}
          </div>
          <div className="app-card-sub">Sign in with your number to open your dashboard.</div>
          <div className="app-actions">
            <button className="pp-btn primary" onClick={pp.openAuthModal}>
              Sign in
            </button>
            <Link to="/" className="pp-btn secondary">
              Return home
            </Link>
          </div>
        </section>
      </PublicShellX>
    );
  return (
    <PublicShellX title="Claim your stall" subtitle={claim.buildingName + " \u00b7 " + claim.loc}>
      <section className="app-card">
        <div className="app-card-title">{claim.businessName || claim.ownerName || "Your stall"}</div>
        <div className="app-card-sub">
          {claim.ownerName + " \u00b7 " + (claim.phone || "No phone on file")}
        </div>
        <div className="app-card-sub">
          {"Sign in with this number to claim the stall. " +
            (claim.verified
              ? "The landlord has already verified you."
              : "You'll show as Pending until the landlord verifies you.")}
        </div>
        <div className="app-actions">
          <button
            className="pp-btn primary"
            onClick={function () {
              pp.openClaimSignIn(claim.token);
            }}
          >
            Sign in to claim
          </button>
        </div>
      </section>
    </PublicShellX>
  );
}