"use client";

import { usePlugPay } from "@/store/context";

export function ReceiptDoneButton() {
  var pp = usePlugPay();
  return (
    <button
      className="rm-btn rmb-secondary"
      onClick={function () {
        pp.closeModal("modal-receipt");
        pp.focusMerchantProfileTab();
      }}
    >
      Done
    </button>
  );
}