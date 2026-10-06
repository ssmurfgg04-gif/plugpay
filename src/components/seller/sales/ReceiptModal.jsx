"use client";

import { usePlugPay } from "@/store/context";
import { Modal } from "@/components/ui/Modal";
import { ReceiptOpenButton } from "@/components/seller/sales/ReceiptOpenButton";
import { ReceiptDoneButton } from "@/components/seller/sales/ReceiptDoneButton";

export function ReceiptModal() {
  var pp = usePlugPay();
  var r = pp.receipt,
    isInv = r.kind === "invoice",
    sp = pp.sellerProfile;
  var closeStyle = {
    background: "rgba(255,255,255,.16)",
    color: "#fff",
    borderColor: "rgba(255,255,255,.65)",
  };
  function row(l, v, cls) {
    return (
      <div className={"rm-row" + (cls ? " " + cls : "")} key={l + v}>
        <span className="rm-lbl">{l}</span>
        <span className="rm-val">{v}</span>
      </div>
    );
  }
  return (
    <Modal
      id="modal-receipt"
      innerClassName="receipt-modal"
      closeButtonStyle={closeStyle}
      onExit={pp.focusMerchantProfileTab}
    >
      <div className="rm-top">
        <div className="rm-icon">{isInv ? "\uD83D\uDCC4" : "\uD83E\uDDFE"}</div>
        <div className="rm-title">{isInv ? "Invoice sent!" : "Receipt sent!"}</div>
        <div className="rm-sub">
          {isInv
            ? "Payment link delivered \u00b7 add the M-Pesa code once it's paid"
            : "Sale recorded \u00b7 Review link attached \u00b7 Stock updated"}
        </div>
      </div>
      <div className="rm-body">
        <div className="rm-rows">
          {row("Seller", sp.bizName + " \u00b7 " + pp.stallAssignment.loc)}
          {row(isInv ? "Invoice" : "Receipt #", isInv ? "#" + String(r.code).toUpperCase() : r.code)}
          {row("Buyer", (r.name ? r.name + " \u00b7 " : "") + r.phone)}
          {r.items.map(function (it, i) {
            return (
              <div className="rm-row item-row" key={i}>
                <span className="rm-lbl">{it.name + (it.qty > 1 ? " \u00d7 " + it.qty : "")}</span>
                <span className="rm-val">{"KSh " + Number(it.price).toLocaleString()}</span>
              </div>
            );
          })}
          {row("Total", "KSh " + Number(r.total).toLocaleString(), "total")}
        </div>
        <div className="rm-verified">
          <span
            style={{
              fontSize: "18px",
            }}
          >
            {"\u2713"}
          </span>
          <div>
            <div className="rm-verified-text">Sent to the buyer's WhatsApp</div>
            <div
              className="rm-verified-text"
              style={{
                opacity: ".6",
                fontSize: "10px",
              }}
            >
              {isInv
                ? "Not counted as a sale until it is paid and a receipt is sent"
                : "Review link is open for 6 hours \u00b7 one review per receipt"}
            </div>
          </div>
        </div>
        <div className="rm-actions">
          <button
            className="rm-btn rmb-primary"
            onClick={function () {
              if (isInv) pp.resendInvoice(r.code);
              else pp.sendReceipt(r.code);
            }}
          >
            {isInv ? "Resend on WhatsApp" : "Resend with review link"}
          </button>
          <ReceiptOpenButton isInv={isInv} code={r.code} />
          <ReceiptDoneButton />
        </div>
      </div>
    </Modal>
  );
}