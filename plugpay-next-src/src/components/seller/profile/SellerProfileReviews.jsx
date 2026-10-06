"use client";

import { useSellerProfileForm } from "@/lib/seller";
import { SellerReviewsCard } from "@/components/seller/shell/SellerReviewsCard";

export function SellerProfileReviews() {
  var f = useSellerProfileForm(),
    pp = f.pp,
    sp = f.sp,
    S = f.S,
    pm = f.pm,
    PMETHODS = f.PMETHODS,
    noAcct = f.noAcct,
    YEARS = f.YEARS;
  return <SellerReviewsCard />;
}