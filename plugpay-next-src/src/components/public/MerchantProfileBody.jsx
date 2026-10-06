"use client";

import { usePlugPay } from "@/store/context";
import { PublicSellerProfileHeader } from "@/components/public/PublicSellerProfileHeader";
import { ProfileTab } from "@/components/public/ProfileTab";
import { CatalogueTab } from "@/components/public/CatalogueTab";
import { ReviewsTab } from "@/components/public/ReviewsTab";
import { BuildingTab } from "@/components/public/BuildingTab";
import { PublicSellerBottomNavigation } from "@/components/public/PublicSellerBottomNavigation";

/* The ONE public seller profile. Modal and /sellers/:id page both render this. */
/* The ONE public seller profile. Modal and /sellers/:id page both render this. */
export function MerchantProfileBody(props) {
  var pp = usePlugPay();
  var tab = pp.merchantTab,
    setTab = pp.setMerchantTab;
  return (
    <>
      <div className="tp-navbar-fixed">
        <button className="tp-navbar-btn" onClick={props.onClose} aria-label="Back">
          {"\u2190"}
        </button>
        <div className="tp-navbar-title">{""}</div>
        <button className="modal-close" aria-label="Close" onClick={props.onClose}>
          {"\u2715"}
        </button>
      </div>
      <div className="tp-body public-seller-profile">
        {tab === "profile" && <PublicSellerProfileHeader seller={pp.viewedSeller} />}
        {tab === "profile" && (
          <ProfileTab
            onViewCatalogue={function () {
              setTab("catalogue");
            }}
          />
        )}
        {tab === "catalogue" && <CatalogueTab />}
        {tab === "reviews" && <ReviewsTab />}
        {tab === "building" && <BuildingTab />}
      </div>
      <PublicSellerBottomNavigation active={tab} onChange={setTab} />
    </>
  );
}