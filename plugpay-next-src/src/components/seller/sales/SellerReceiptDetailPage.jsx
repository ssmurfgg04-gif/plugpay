"use client";

import { Link } from "@/components/ui/Link";
import { usePlugPay } from "@/store/context";
import { codeOf, relTime } from "@/lib/shared";
import { SellerGate } from "@/components/seller/auth/SellerGate";
import { AppShellSeller } from "@/components/seller/shell/AppShellSeller";
import { ErrorState } from "@/components/ui/ErrorState";
import { reviewLink, reviewStatus, salesDocStatus, sellerBadgeInfo } from "@/lib/seller";
import { Ic } from "@/components/ui/Ic";
import { DocTrader } from "@/components/seller/sales/DocTrader";
import { DocBadges } from "@/components/seller/sales/DocBadges";
import { DocItems } from "@/components/seller/sales/DocItems";
import { ReviewChip } from "@/components/seller/sales/ReviewChip";

export function SellerReceiptDetailPage(props) {
  var pp = usePlugPay();
  var code = codeOf(props.code);
  var sale = pp.receiptsList.filter(function (r) {
    return codeOf(r.code) === code;
  })[0];
  if (!pp.merchantLoggedIn) return <SellerGate active="sales" msg="Sign in to view this receipt." />;
  if (!sale)
    return (
      <AppShellSeller title="Receipt not found">
        <ErrorState
          icon="receipt"
          title="Receipt not found"
          sub="We couldn't find that receipt. It may have been removed."
          backTo="/seller/receipts"
          backLabel="Back to sales"
        />
      </AppShellSeller>
    );
  var sp = pp.sellerProfile,
    badges = sellerBadgeInfo(pp),
    st = reviewStatus(sale);
  var rComplete = salesDocStatus("receipt", sale) === "COMPLETE";
  return (
    <AppShellSeller
      title={"Receipt " + sale.code}
      subtitle={
        sale.sentAt
          ? "Sent " + relTime(sale.sentAt) + ". The review link went with it."
          : "Not sent yet. Send it to record the sale and update your stock."
      }
    >
      <div className="doc-wrap">
        <div className="doc-card">
          <div className="doc-band">
            <div className="doc-band-top">
              <div className="doc-kind">{Ic("receipt", 12)}PlugPay Receipt</div>
              <span className={"doc-status " + (rComplete ? "paid" : "pending")}>
                {Ic(rComplete ? "badge-check" : "clock", 11)}
                {rComplete ? "Complete" : "Pending"}
              </span>
            </div>
            <div className="doc-amt">{"KSh " + sale.total.toLocaleString()}</div>
            <div className="doc-amt-label">
              {"Paid by " +
                (sale.buyerName || "Buyer") +
                " \u00b7 " +
                new Date(sale.createdAt).toLocaleString()}
            </div>
          </div>
          <DocTrader sp={sp} />
          <DocBadges badges={badges} />
          <div className="doc-sec">
            <div className="doc-sec-h">{Ic("user", 13)}Buyer & payment</div>
            <div className="doc-row">
              <span>Buyer phone</span>
              <strong>{sale.buyerPhone}</strong>
            </div>
            <div className="doc-row">
              <span>Payment ref</span>
              <strong>{sale.paymentRef || codeOf(sale.code)}</strong>
            </div>
          </div>
          <DocItems items={sale.items} />
          <div className="doc-total-row">
            <span>Total paid</span>
            <strong>{"KSh " + sale.total.toLocaleString()}</strong>
          </div>
          <div className="doc-sec">
            <div className="doc-sec-h">{Ic("star", 13)}Buyer review</div>
            <div
              style={{
                marginBottom: 8,
              }}
            >
              <ReviewChip r={sale} />
            </div>
            {st.state === "done" && (
              <div>
                <div className="rev-stars-big">
                  {"\u2605".repeat(sale.review.rating) + "\u2606".repeat(5 - sale.review.rating)}
                </div>
                {sale.review.comment && <div className="rev-item-text">{sale.review.comment}</div>}
              </div>
            )}
            {st.state === "open" && (
              <div
                className="doc-note"
                style={{
                  padding: 0,
                }}
              >
                The buyer can review once, within 6 hours of receiving this receipt.
              </div>
            )}
            {st.state === "expired" && (
              <div
                className="doc-note"
                style={{
                  padding: 0,
                }}
              >
                The 6-hour review window has closed. Reviews are one per receipt.
              </div>
            )}
          </div>
          <div className="doc-actions">
            <button
              className="es-btn"
              onClick={function () {
                pp.sendReceipt(sale.code);
              }}
            >
              {Ic("send", 14)}
              {sale.sentAt ? "Resend on WhatsApp" : "Send receipt on WhatsApp"}
            </button>
            <Link to={"/r/" + code} className="es-btn alt">
              {Ic("receipt", 14)}Public copy
            </Link>
            <button
              className="es-btn alt"
              onClick={function () {
                pp.setDocumentStatus("receipt", sale.code, rComplete ? "PENDING" : "COMPLETE");
              }}
            >
              {Ic(rComplete ? "clock" : "badge-check", 14)}
              {rComplete ? "Mark pending" : "Mark complete"}
            </button>
            <button
              className="es-btn alt"
              onClick={function () {
                pp.copyText(reviewLink(sale.code), "Review link copied");
              }}
            >
              {Ic("star", 14)}Copy review link
            </button>
          </div>
          <div
            className="app-actions"
            style={{
              padding: "0 20px 18px",
            }}
          >
            <Link to="/seller/receipts" className="pp-btn secondary">
              Back to sales
            </Link>
          </div>
        </div>
      </div>
    </AppShellSeller>
  );
}