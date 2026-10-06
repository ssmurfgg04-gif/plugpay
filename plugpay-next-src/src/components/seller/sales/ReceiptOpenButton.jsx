"use client";

import { navigate } from "@/lib/nav";
import { usePlugPay } from "@/store/context";

export function ReceiptOpenButton(props) {
  var pp = usePlugPay();
  return (
    <button
      className="rm-btn rmb-secondary"
      onClick={function () {
        pp.closeModal("modal-receipt");
        navigate(props.isInv ? "/seller/invoices" : "/seller/receipts/" + encodeURIComponent(props.code));
      }}
    >
      {props.isInv ? "View invoice" : "Open receipt"}
    </button>
  );
}