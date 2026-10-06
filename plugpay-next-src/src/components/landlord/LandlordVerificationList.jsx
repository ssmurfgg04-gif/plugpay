"use client";

import { usePlugPay } from "@/store/context";
import { LandlordSellerList } from "@/components/landlord/LandlordSellerList";

export function LandlordVerificationList() {
  var pp = usePlugPay();
  return (
    <LandlordSellerList
      title="Awaiting verification"
      subtitle="Sellers waiting for landlord verification."
      items={pp.pendingTraders}
      actionLabel="Verify"
      action={function (seller) {
        pp.llVerifyTrader(seller.id);
      }}
      empty="No sellers awaiting verification."
    />
  );
}