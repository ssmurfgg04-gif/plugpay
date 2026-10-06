"use client";

import { useSellerProfileForm } from "@/lib/seller";
import { EditRow } from "@/components/seller/shell/EditRow";

export function SellerProfileAbout() {
  var f = useSellerProfileForm(),
    pp = f.pp,
    sp = f.sp,
    S = f.S,
    pm = f.pm,
    PMETHODS = f.PMETHODS,
    noAcct = f.noAcct,
    YEARS = f.YEARS;
  return (
    <div className="tp-card tp-info-card">
      <EditRow label="ABOUT THE BUSINESS" value={sp.about} onSave={S("about")} multiline={true} last={true} />
    </div>
  );
}