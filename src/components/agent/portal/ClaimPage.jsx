"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/components/ui/Link";
import { usePlugPay } from "@/store/context";
import { PublicShellX } from "@/components/layout/PublicShellX";

export function ClaimPage(props) {
  var pp = usePlugPay();
  var localClaim = pp.agentClaims.filter(function (c) {
    return c.token === props.token;
  })[0];
  const [claim, setClaim] = useState(localClaim || null);
  const [loading, setLoading] = useState(true);
  var opened = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/claims?token=" + encodeURIComponent(props.token), { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (active && data && data.ok && data.claim) setClaim(data.claim);
      })
      .catch(() => {
        // Same-device demo/local claims can still be opened from local storage.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [props.token]);

  useEffect(() => {
    if (claim && claim.status === "INVITED" && !opened.current) {
      opened.current = true;
      const timer = setTimeout(() => {
        pp.openClaimSignIn(claim.token, claim);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [claim, pp.openClaimSignIn]);

  if (!claim && loading)
    return (
      <PublicShellX title="Loading claim">
        <section className="app-card">
          <div className="app-card-title">Loading your seller invitation…</div>
          <div className="app-card-sub">Checking the claim link.</div>
        </section>
      </PublicShellX>
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
          <div className="app-card-sub">Sign in to open your seller dashboard.</div>
          <div className="app-actions">
            <button className="pp-btn primary" onClick={() => pp.openAuthModal("trader")}>
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
    <PublicShellX title="Claim your stall" subtitle={claim.buildingName + " · " + claim.loc}>
      <section className="app-card">
        <div className="app-card-title">{claim.businessName || claim.ownerName || "Your stall"}</div>
        <div className="app-card-sub">{claim.ownerName + " · " + (claim.phone || "No phone on file")}</div>
        <div className="app-card-sub">
          {claim.verified
            ? "The landlord has marked this seller as verified."
            : "Your profile will show as pending until the landlord verifies the stall."}
        </div>
        <div className="app-actions">
          <button className="pp-btn primary" onClick={() => pp.openClaimSignIn(claim.token, claim)}>
            Create account or sign in to claim
          </button>
        </div>
      </section>
    </PublicShellX>
  );
}
