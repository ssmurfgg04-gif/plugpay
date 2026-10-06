"use client";

import { Link } from "@/components/ui/Link";
import { usePlugPay } from "@/store/context";
import { SellerGate } from "@/components/seller/auth/SellerGate";
import { AppShellSeller } from "@/components/seller/shell/AppShellSeller";
import { ErrorState } from "@/components/ui/ErrorState";
import { salesDocStatus, sellerBadgeInfo } from "@/lib/seller";
import { Ic } from "@/components/ui/Ic";
import { DocTrader } from "@/components/seller/sales/DocTrader";
import { DocBadges } from "@/components/seller/sales/DocBadges";
import { DocPayInfo } from "@/components/seller/sales/DocPayInfo";
import { DocItems } from "@/components/seller/sales/DocItems";
import { InvoiceConvertBox } from "@/components/seller/sales/InvoiceConvertBox";

export function SellerInvoiceDetailPage(props) {
  var pp = usePlugPay();
  var inv = pp.invoicesList.filter(function (x) {
    return x.token === props.token;
  })[0];
  if (!pp.merchantLoggedIn) return <SellerGate active="sales" msg="Sign in to view this invoice." />;
  if (!inv)
    return (
      <AppShellSeller title="Invoice not found">
        <ErrorState
          icon="file-text"
          title="Invoice not found"
          sub="We couldn't find that invoice. It may have been removed."
          backTo="/seller/invoices"
          backLabel="Back to sales"
        />
      </AppShellSeller>
    );
  var sp = pp.sellerProfile,
    badges = sellerBadgeInfo(pp);
  var paid = inv.status === "PAID";
  var complete = salesDocStatus("invoice", inv) === "COMPLETE";
  return (
    <AppShellSeller
      title={"Invoice" + (inv.number ? " " + inv.number : "")}
      subtitle={
        paid
          ? "Paid. A receipt was created from this invoice."
          : "Awaiting payment. Paste the M-Pesa code or message below once the buyer pays."
      }
    >
      <div className="doc-wrap">
        <div className="doc-card">
          <div className="doc-band">
            <div className="doc-band-top">
              <div className="doc-kind">{Ic("file-text", 12)}PlugPay Invoice</div>
              <span className={"doc-status " + (complete ? "paid" : "pending")}>
                {Ic(complete ? "badge-check" : "clock", 11)}
                {complete ? "Complete" : "Pending"}
              </span>
            </div>
            <div className="doc-amt">{"KSh " + Number(inv.total || 0).toLocaleString()}</div>
            <div className="doc-amt-label">
              {"Billed to " +
                (inv.buyerName || "Buyer") +
                " \u00b7 " +
                new Date(inv.createdAt).toLocaleString()}
            </div>
          </div>
          <DocTrader sp={sp} />
          <DocBadges badges={badges} />
          <div className="doc-sec">
            <div className="doc-sec-h">{Ic("user", 13)}Buyer & payment</div>
            {inv.number && (
              <div className="doc-row">
                <span>Invoice no.</span>
                <strong>{inv.number}</strong>
              </div>
            )}
            <div className="doc-row">
              <span>Buyer phone</span>
              <strong>{inv.buyerPhone || "\u2014"}</strong>
            </div>
            <div className="doc-row">
              <span>Payment</span>
              <strong>{paid ? "Paid" : "Awaiting payment"}</strong>
            </div>
            {inv.paymentRef && (
              <div className="doc-row">
                <span>M-Pesa code</span>
                <strong>{inv.paymentRef}</strong>
              </div>
            )}
          </div>
          {!paid && <DocPayInfo sp={sp} />}
          <DocItems items={inv.items || []} />
          <div className="doc-total-row">
            <span>{paid ? "Total paid" : "Total due"}</span>
            <strong>{"KSh " + Number(inv.total || 0).toLocaleString()}</strong>
          </div>
          {!paid && (
            <div
              style={{
                padding: "0 20px 14px",
              }}
            >
              <InvoiceConvertBox pp={pp} doc={inv} />
            </div>
          )}
          <div className="doc-actions">
            {!paid && (
              <button
                className="es-btn"
                onClick={function () {
                  pp.setDocumentStatus("invoice", inv.token, complete ? "PENDING" : "COMPLETE");
                }}
              >
                {Ic(complete ? "clock" : "badge-check", 14)}
                {complete ? "Mark pending" : "Mark complete"}
              </button>
            )}
            {!paid && (
              <button
                className="es-btn alt"
                onClick={function () {
                  pp.resendInvoice(inv.token);
                }}
              >
                {Ic("send", 14)}Resend on WhatsApp
              </button>
            )}
            <Link to={"/pay/" + inv.token} className="es-btn alt">
              {Ic("link", 14)}Payment link
            </Link>
            {paid && inv.paymentRef && (
              <Link
                to={"/seller/receipts/" + encodeURIComponent("#" + inv.paymentRef)}
                className="es-btn alt"
              >
                {Ic("receipt", 14)}Open receipt
              </Link>
            )}
          </div>
          <div
            className="app-actions"
            style={{
              padding: "0 20px 18px",
            }}
          >
            <Link to="/seller/invoices" className="pp-btn secondary">
              Back to sales
            </Link>
          </div>
        </div>
      </div>
    </AppShellSeller>
  );
}