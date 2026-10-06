"use client";

import { useSellerProfileForm } from "@/lib/seller";
import { SellerHero } from "@/components/seller/shell/SellerHero";

export function SellerProfileHero() {
  var f = useSellerProfileForm(),
    pp = f.pp,
    sp = f.sp,
    S = f.S,
    pm = f.pm,
    PMETHODS = f.PMETHODS,
    noAcct = f.noAcct,
    YEARS = f.YEARS;
  return <SellerHero editable={true} />;
}