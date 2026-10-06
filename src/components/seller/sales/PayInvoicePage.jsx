"use client";

import { Link } from "@/components/ui/Link";
import { usePlugPay } from "@/store/context";
import { PublicShellX } from "@/components/layout/PublicShellX";
import { ErrorState } from "@/components/ui/ErrorState";
import { openWhatsApp, sellerBadgeInfo } from "@/lib/seller";
import { Ic } from "@/components/ui/Ic";
import { DocTrader } from "@/components/seller/sales/DocTrader";
import { DocBadges } from "@/components/seller/sales/DocBadges";
import { DocPayInfo } from "@/components/seller/sales/DocPayInfo";
import { DocItems } from "@/components/seller/sales/DocItems";

export function PayInvoicePage(props) {
  var pp = usePlugPay();
  var invoice = pp.invoicesList.filter(function (x) {
    return x.token === props.token;
  })[0];
  if (!invoice)
    return (
      <PublicShellX title="Invoice not found">
        <ErrorState
          icon="file-text"
          title="Invoice unavailable"
          sub="This invoice is no longer available or the link is wrong."
          backTo="/"
          backLabel="Return home"
        />
      </PublicShellX>
    );
  var sp = pp.sellerProfile,
    badges = sellerBadgeInfo(pp);
  var paid = invoice.status === "PAID";
  return (
    <PublicShellX
      title="PlugPay invoice"
      subtitle={sp.bizName + " \u00b7 " + (paid ? "Paid" : "Awaiting payment")}
    >
      <div className="doc-wrap">
        <div className="doc-card">
          <div className="doc-band">
            <div className="doc-band-top">
              <div className="doc-kind">{Ic("file-text", 12)}PlugPay Invoice</div>
              <span className={"doc-status " + (paid ? "paid" : "pending")}>
                {Ic(paid ? "badge-check" : "clock", 11)}
                {paid ? "Paid" : "Pending"}
              </span>
            </div>
            <div className="doc-amt">{"KSh " + invoice.total.toLocaleString()}</div>
            <div className="doc-amt-label">
              {"Requested from " +
                invoice.buyerName +
                " \u00b7 " +
                new Date(invoice.createdAt).toLocaleString()}
            </div>
          </div>
          <DocTrader sp={sp} />
          <DocBadges badges={badges} />
          <div className="doc-sec">
            <div className="doc-sec-h">{Ic("user", 13)}Bill to</div>
            <div className="doc-row">
              <span>Buyer</span>
              <strong>{invoice.buyerName}</strong>
            </div>
            <div className="doc-row">
              <span>Phone</span>
              <strong>{invoice.buyerPhone}</strong>
            </div>
            <div className="doc-row">
              <span>Sent via</span>
              <strong>{invoice.source}</strong>
            </div>
          </div>
          {!paid && <DocPayInfo sp={sp} />}
          <DocItems items={invoice.items} />
          <div className="doc-total-row">
            <span>{paid ? "Total paid" : "Total due"}</span>
            <strong>{"KSh " + invoice.total.toLocaleString()}</strong>
          </div>
          <div className="doc-actions">
            {!paid && (
              <button
                className="es-btn"
                onClick={function () {
                  pp.showToast("Opening M-Pesa to pay " + sp.bizName + "\u2026");
                }}
              >
                {Ic("credit-card", 14)}Pay via M-Pesa
              </button>
            )}
            {paid && invoice.paymentRef && (
              <Link to={"/r/" + encodeURIComponent(invoice.paymentRef)} className="es-btn">
                {Ic("receipt", 14)}View receipt
              </Link>
            )}
            <button
              className="es-btn alt"
              onClick={function () {
                openWhatsApp(
                  sp.whatsapp || sp.phone,
                  "Hi " +
                    sp.bizName +
                    ", I'm following up on invoice for KSh " +
                    invoice.total.toLocaleString(),
                );
              }}
            >
              {Ic("message-circle", 14)}Message seller
            </button>
          </div>
          <div className="doc-note">
            {paid
              ? "This invoice has been paid and a receipt was issued to the buyer."
              : "This is a pending payment-link invoice. It only becomes a confirmed sale once the seller marks it as paid with the M-Pesa code."}
          </div>
        </div>
      </div>
    </PublicShellX>
  );
}