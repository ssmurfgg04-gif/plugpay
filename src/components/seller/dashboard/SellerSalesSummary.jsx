"use client";

import { usePlugPay } from "@/store/context";
import { salesDocStatus } from "@/lib/seller";

export function SellerSalesSummary() {
  var pp = usePlugPay();
  var rc = pp.receiptsList || [],
    iv = pp.invoicesList || [];
  var all = rc
    .map(function (r) {
      return salesDocStatus("receipt", r);
    })
    .concat(
      iv.map(function (i) {
        return salesDocStatus("invoice", i);
      }),
    );
  var complete = all.filter(function (x) {
    return x === "COMPLETE";
  }).length;
  function cell(n, label) {
    return (
      <div>
        <strong>{n}</strong>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <div className="seller-sales-summary">
      {cell(rc.length, "Receipts")}
      {cell(iv.length, "Invoices")}
      {cell(complete, "Complete")}
      {cell(all.length - complete, "Pending")}
    </div>
  );
}