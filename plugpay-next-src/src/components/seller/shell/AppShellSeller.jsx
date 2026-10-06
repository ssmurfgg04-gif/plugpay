"use client";

import { usePlugPay } from "@/store/context";
import { SellerGate } from "@/components/seller/auth/SellerGate";
import { SellerPortalShell } from "@/components/seller/shell/SellerPortalShell";
import { WithSkeleton } from "@/components/ui/WithSkeleton";

// Sales sub-pages live inside the same single seller shell (Sales tab)
// Sales sub-pages live inside the same single seller shell (Sales tab)
export function AppShellSeller(props) {
  var pp = usePlugPay();
  if (!pp.merchantLoggedIn)
    return <SellerGate active="sales" msg="Sign in to your seller account to continue." />;
  return (
    <SellerPortalShell active="sales">
      <div
        style={{
          padding: "16px 12px 40px",
        }}
      >
        <div className="app-heading">
          <div>
            <h1>{props.title}</h1>
            {props.subtitle && <p>{props.subtitle}</p>}
          </div>
        </div>
        <WithSkeleton kind="list" dep={props.title}>
          {props.children}
        </WithSkeleton>
      </div>
    </SellerPortalShell>
  );
}