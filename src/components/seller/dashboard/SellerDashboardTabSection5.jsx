"use client";

import { Link } from "@/components/ui/Link";
import { usePlugPay } from "@/store/context";
import { salesDocStatus } from "@/lib/seller";
import { SellerSalesSummary } from "@/components/seller/dashboard/SellerSalesSummary";

export function SellerDashboardTabSection5() {
  var pp = usePlugPay();
  var receipts = pp.receiptsList || [],
    invoices = pp.invoicesList || [];
  function toRow(kind, d) {
    var isInv = kind === "invoice";
    return {
      key: isInv ? d.token : d.code,
      code: isInv ? d.number || "Invoice \u00b7 " + (d.buyerName || "Buyer") : d.code,
      state: salesDocStatus(kind, d),
      total: Number(d.total) || 0,
      to: isInv
        ? "/seller/invoices/" + encodeURIComponent(d.token)
        : "/seller/receipts/" + encodeURIComponent(d.code),
    };
  }
  function docCol(title, list) {
    return (
      <div className="sp-document-column">
        <div className="sp-document-heading">{title}</div>
        {list.length === 0 && <div className="sales-doc-sub">None yet</div>}
        {list.map(function (r) {
          return (
            <Link key={r.key} to={r.to} className="sp-document-row">
              <span>{r.code}</span>
              <strong>{"KSh " + r.total.toLocaleString()}</strong>
              <em className={r.state === "COMPLETE" ? "complete" : "pending"}>{r.state}</em>
            </Link>
          );
        })}
      </div>
    );
  }
  return (
    <div className="dx-card">
      <div className="dx-head">
        <div
          className="dx-k"
          style={{
            margin: 0,
          }}
        >
          Invoices & receipts
        </div>
        <span className="dx-chip ok">{receipts.length + invoices.length + " records"}</span>
      </div>
      <SellerSalesSummary />
      <div className="sp-document-summary">
        {docCol(
          "Receipts \u00b7 " + receipts.length,
          receipts.slice(0, 5).map(function (d) {
            return toRow("receipt", d);
          }),
        )}
        {docCol(
          "Invoices \u00b7 " + invoices.length,
          invoices.slice(0, 5).map(function (d) {
            return toRow("invoice", d);
          }),
        )}
      </div>
      <div className="dx-btns">
        <Link to="/seller/receipts" className="bd-btn fill">
          <span>View all sales</span>
          <span className="a">{"\u2192"}</span>
        </Link>
      </div>
    </div>
  );
}