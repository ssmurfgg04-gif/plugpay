"use client";

import { usePlugPay } from "@/store/context";
import { SellerPortalShell } from "@/components/seller/shell/SellerPortalShell";
import { DashSignIn } from "@/components/layout/DashSignIn";

export function SellerGate(props) {
  var pp = usePlugPay();
  return (
    <SellerPortalShell active={props.active} noDock={true}>
      <div
        style={{
          padding: 12,
        }}
      >
        <DashSignIn
          msg={props.msg || "Sign in to your seller account to open your dashboard."}
          onClick={pp.openAuthModal}
        />
      </div>
    </SellerPortalShell>
  );
}