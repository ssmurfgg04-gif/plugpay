"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePlugPay } from "@/store/context";

const ROUTE_MODALS = [
  "modal-merchant", "modal-building", "modal-quick", "modal-receipt", "modal-record-sale",
  "modal-register", "modal-landlord", "modal-admit-seller", "modal-onboard", "modal-stall",
];

// Closes every open modal whenever the route changes (same behaviour as the prototype's router).
export function RouteEffects() {
  const pathname = usePathname();
  const pp = usePlugPay();
  useEffect(() => {
    ROUTE_MODALS.forEach((id) => pp.closeModal(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
}