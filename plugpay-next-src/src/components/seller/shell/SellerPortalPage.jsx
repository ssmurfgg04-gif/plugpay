"use client";

import { SellerDashboardTab } from "@/components/seller/dashboard/SellerDashboardTab";
import { SellerProfileTab } from "@/components/seller/profile/SellerProfileTab";
import { SellerCatalogueTab } from "@/components/seller/catalogue/SellerCatalogueTab";
import { ReviewsTab } from "@/components/public/ReviewsTab";
import { BuildingTab } from "@/components/public/BuildingTab";
import { usePlugPay } from "@/store/context";
import { SellerGate } from "@/components/seller/auth/SellerGate";
import { SellerPortalShell } from "@/components/seller/shell/SellerPortalShell";
import { WithSkeleton } from "@/components/ui/WithSkeleton";

const SELLER_TABS = {
  dashboard: SellerDashboardTab,
  profile: SellerProfileTab,
  catalogue: SellerCatalogueTab,
  reviews: ReviewsTab,
  building: BuildingTab,
};

export function SellerPortalPage(props) {
  var pp = usePlugPay();
  if (!pp.merchantLoggedIn) return <SellerGate active={props.tab} />;
  var Tab = SELLER_TABS[props.tab] || SellerDashboardTab;
  var body = <Tab />;
  return (
    <SellerPortalShell active={props.tab}>
      <WithSkeleton
        kind={props.tab === "catalogue" ? "cards" : props.tab === "dashboard" ? "dash" : "list"}
        dep={props.tab}
      >
        {body}
      </WithSkeleton>
    </SellerPortalShell>
  );
}