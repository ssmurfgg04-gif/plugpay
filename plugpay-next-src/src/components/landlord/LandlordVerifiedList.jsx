"use client";

import { usePlugPay } from "@/store/context";
import { LandlordSellerList } from "@/components/landlord/LandlordSellerList";
import { landlordVacateSeller } from "@/lib/landlord";

export function LandlordVerifiedList() {
  var pp = usePlugPay();
  return (
    <LandlordSellerList
      title="Verified by landlord"
      subtitle="Sellers currently occupying this building."
      items={pp.verifiedTraders}
      actionLabel="Vacate"
      action={function (seller) {
        landlordVacateSeller(pp, seller);
      }}
      empty="No verified sellers yet."
    />
  );
}